//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const lib = require("./dateFunctions");
const favicon = require('serve-favicon');

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(__dirname + "/public/favicon.ico"));

// DATABASE
mongoose.connect("mongodb://localhost:27017/calendarDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

const eventSchema = {
  date: Date,
  slot: String,
  name: String
};
const Event = mongoose.model("Event", eventSchema);

const weekSchema = {
  yearWeek: {
    type: String,
    unique: true
  },
  weekEvents: [eventSchema]
};
const Week = mongoose.model("Week", weekSchema);

// default events
let thisDay = new Date;
let thisWeek = lib.entireWeek(thisDay);
let thisWeekNumber = lib.getWeekNumber(thisDay)[0] + "-" + lib.getWeekNumber(thisDay)[1];
const defaultEvent = new Event({
  date: thisWeek[0],
  slot: "00:00",
  name: ""
});
const defaultWeek = new Week({
  yearWeek: thisWeekNumber,
  weekEvents: [defaultEvent]
});

const today = new Date;

// HOME
app.get("/", function(req, res) {
  res.render("home", { title: "HOME"});
});

// CALENDAR
app.get("/calendar", function(req, res) {

  Week.find({
    yearWeek: thisWeekNumber
  }, function(err, foundEvents) {
    if (!err) {
      if (foundEvents.length === 0) {
        Event.insertMany(defaultEvent, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Default event successfully added.");
          }
        });
        Week.insertMany(defaultWeek, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Default week saved to db.");
          }
        });
        res.redirect("/calendar")
      } else {
        res.render("calendar", {foundEvents: foundEvents[0].weekEvents, weekDates: thisWeek, title: "CALENDAR"})
      }
    }
  })

})

app.post("/calendar", function(req, res) {

  //week displayed
  if (req.body.button === "back" || req.body.button === "forward") {
    let firstDay = new Date;
    if (req.body.button === "back") {
      firstDay = new Date(today.setDate(today.getDate() - 7));
    } else if (req.body.button === "forward") {
      firstDay = new Date(today.setDate(today.getDate() + 7));
    }

      thisWeek = lib.entireWeek(firstDay);
      thisWeekNumber = lib.getWeekNumber(firstDay)[0] + "-" + lib.getWeekNumber(firstDay)[1];

      const newEvent = new Event({
        date: thisWeek[0],
        slot: "7:00",
        name: ""
      });
      const newWeek = new Week({
        yearWeek: thisWeekNumber,
        weekEvents: [newEvent]
      });

      Week.find({
        yearWeek: thisWeekNumber
      }, function(err, foundEvents) {
        if (!err) {
          if (foundEvents.length === 0) {
            Event.insertMany(newEvent, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log("New default event added to db.");
              }
            });
            Week.insertMany(newWeek, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log("New week successfully added to the db.");
              }
            });
          }
        }
        res.redirect("/calendar");
      });
    };


  // add and update events
  if (req.body.button === "add") {
    const dateInput = new Date(req.body.eventDate);
    const timeInput = req.body.eventTime;
    const eventInput = req.body.eventName;
    const weekNumberInput = lib.getWeekNumber(dateInput)[0] + "-" + lib.getWeekNumber(dateInput)[1];

    Event.findOneAndUpdate({date: dateInput, slot: timeInput}, {name: eventInput}, function(err, foundEvent) {
      if (!err) {
        //add
        if (!foundEvent) {
          const newEventInput = new Event({
            date: dateInput,
            slot: timeInput,
            name: eventInput
          });
          newEventInput.save();
          Week.findOne({yearWeek: weekNumberInput}, function(err2, foundWeek) {
            if (!err2) {
              if (foundWeek) {
                foundWeek.weekEvents.push(newEventInput);
                foundWeek.save()
              } else {
                const newWeekInput = new Week({
                  yearWeek: weekNumberInput,
                  weekEvents: [newEventInput]
                });
              }
            } else {
              console.log(err);
            }
            res.redirect("/calendar")
          });
        } else {
          let eventId = foundEvent._id;
          //update
          Week.updateOne(
            {yearWeek: weekNumberInput, "weekEvents._id": eventId},
             {"$set": {"weekEvents.$.name": eventInput}},
              function(err3) {
            if (!err3) {
              res.redirect("/calendar")
            }
          });
        }
      } else {
        console.log(err);
      }
    });
  }

  // delete events
  if (req.body.button.includes("delete")) {

    let arrayDelete = req.body.button.split(/[\s]+/);
    let dateDelete = new Date(arrayDelete[2]);
    let weekDelete = lib.getWeekNumber(dateDelete)[0] + "-" + lib.getWeekNumber(dateDelete)[1];
    let slotDelete = arrayDelete[6];
    console.log(slotDelete);


    // Week.findOneAndUpdate({yearWeek: weekDelete}, {$pull: {weekEvents: {date: , slot: slotDelete }}}, function(err, foundEvents){
    //   if (!err) {
    //     res.redirect("/calendar")
    //   }
    // })

  }

})

app.listen("3000", function() {
  console.log("Server started to run on port 3000.")
});
