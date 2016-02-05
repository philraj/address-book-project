var inquirer = require("inquirer");
var Table = require("cli-table");
var addressBook = require("./addressBook");

module.exports = view;

var viewQuestions = [
    {
        name: "viewChoice",
        message: "What would you like to do with this entry?",
        type: "list",
        choices: ["Edit", "Delete", "Go back to main menu"]
    },
    {
        name: "edit",
        message: ""
    }
];

function view (mainMenu, index) {
    var table = new Table();
    
    // console.log(addressBook[index]);
    var entry = addressBook[index];
    var keys = Object.keys(entry);
    
    //DON'T FORGET FOR LATER...
    //in the object.assign in create.js, add properties like firstNameLabel
    //with the value of "First Name" to the entry object, so that later you can
    //quickly pull out readable english keys instead of firstName, lastName...
    //then you would do...
    //var propertyName = entry[key + "Label"]
    //line[propertyName] = entry[key]
    keys.forEach( function (key) {
        var line = {};
        line[key] = entry[key];
        
        table.push(line);
    });
    
    console.log(table.toString());
    
    inquirer.prompt(viewQuestions, function (answers) {
         switch (answers.viewChoice) {
             case:
         }
    });
    
    mainMenu();
}