//var async = require("async");
var inquirer = require("inquirer");
var create = require("./create");
var addressBook = require("./addressBook.js");

var menu = [
    {
        name: "menuChoice",
        message: "What would you like to do today?",
        type: "list",
        choices: [
            "Create",
            "Search",
            "Quit"
        ]
    }    
]

function showMenu () {
    inquirer.prompt( menu, function (answers) {
        switch (answers.menuChoice) {
            case 'Create':
                create(showMenu);
                break;
            case 'Search':
                //search(showMenu);
                break;
            case 'Quit':
                console.log("Goodbye!");
                break;
        }
    });
}


//start the program
showMenu();