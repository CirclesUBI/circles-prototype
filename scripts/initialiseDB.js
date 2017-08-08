//static data
var fs = require('fs');
var environment = JSON.parse(fs.readFileSync("src/environments/environment.json", 'utf8'));

var databaseData = JSON.parse(fs.readFileSync("scripts/database.json", 'utf8'));

var firebase = require("firebase");
firebase.initializeApp(environment.firebase);

var ref = firebase.app().database().ref();

ref.set(databaseData, function(error) {
    if (error) {
      console.log("database could not be saved." + error);
    }
    else {
      console.log("database saved successfully.");
      process.exit(1);
    }
  });
