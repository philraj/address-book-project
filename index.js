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

function mainMenu () {
    inquirer.prompt( menu, function (answers) {
        switch (answers.menuChoice) {
            case 'Create':
                create(mainMenu);
                break;
            case 'Search':
                //search(mainMenu);
                break;
            case 'Quit':
                console.log("Goodbye!");
                break;
        }
    });
}


//start the program
mainMenu();