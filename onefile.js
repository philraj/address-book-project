var async = require("async");
var inquirer = require("inquirer");
var Table = require("cli-table");

var addressBook = []



var mainMenu = [
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

function start () {
    inquirer.prompt( mainMenu, function (answers) {
        switch (answers.menuChoice) {
            case 'Create':
                create();
                break;
            case 'Search':
                search();
                break;
            case 'Quit':
                console.log("Goodbye!");
                break;
        }
    });
}

//start the program
start();

/******************************create**************************************/

//Object.assign() polyfill
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

//run functions in sequence, passing result from previous to next function
//can take defaults object (entry to use for specifying default values)
function create (defaults) {
    async.waterfall( [
        async.apply(makeEntry, defaults),
        makeAddresses,
        makePhones,
        makeEmails
    ],
        function (err, entryIndex) {
            if (err) throw err;
            //entry is created, so view it, and pass showMenu ref to view.js
            //so that it can redisplay the main menu if needed
            view(entryIndex);
        }
    );
}



function makeEntry (defaults, callback) {
    var initialQuestions = buildInitialQuestions(defaults);
    
    inquirer.prompt(initialQuestions, function (initialAnswers) {
        var entry = Object.assign({}, initialAnswers);
        
        callback(null, entry, defaults);
    });
}

function makeAddresses (entry, defaults, callback) {
    var typeQuestion = {
        name: "addressTypes",
        message: "Types of addresses...",
        type: "checkbox",
        choices: ["home", "work", "other"],
        default: defaults.addressTypes
    }
    
    //prompt the user about which types of addresses they want to add
    inquirer.prompt(typeQuestion, function (typeAnswers) {
        entry.addressTypes = typeAnswers.addressTypes;
        var addressQuestions = buildAddressQuestions(typeAnswers.addressTypes, defaults);
        
        //prompt user for address details using customized address questions
        inquirer.prompt(addressQuestions, function (addressAnswers) {
            //for each selected address type, copy details to entry
            // addressTypes.forEach( function (type) {
            //     entry = Object.assign(entry, addressAnswers);
            // });
            entry = Object.assign(entry, addressAnswers);
            
            callback(null, entry, defaults);
        });         
    });
}

function makePhones (entry, defaults, callback) {
    var typeQuestion = {
        name: "phoneTypes",
        message: "Types of phone numbers...",
        type: "checkbox",
        choices: ["home", "work", "other"],
        default: defaults.phoneTypes
    } 
    
    //prompt the user about which types of phone numbers they want to add
    inquirer.prompt(typeQuestion, function (typeAnswers) {
        entry.phoneTypes = typeAnswers.phoneTypes;
        var phoneQuestions = buildPhoneQuestions(typeAnswers.phoneTypes, defaults);
        
        //prompt user for phone numbers using customized questions
        inquirer.prompt(phoneQuestions, function (phoneAnswers) {
            //for each selected type of phone number, copy details into entry
            // phoneTypes.forEach( function (type) {
            //     entry = Object.assign(entry, phoneAnswers);
            // });
            entry = Object.assign(entry, phoneAnswers);
            
            callback(null, entry, defaults);
        });              
    });
}

function makeEmails (entry, defaults, callback) {
    var typeQuestion = {
        name: "emailTypes",
        message: "Types of email...",
        type: "checkbox",
        choices: ["home", "work", "other"],
        default: defaults.emailTypes
    }
    
    inquirer.prompt(typeQuestion, function (typeAnswers) {
        entry.emailTypes = typeAnswers.emailTypes;
        var emailQuestions = buildEmailQuestions(typeAnswers.emailTypes, defaults);
        
        inquirer.prompt(emailQuestions, function (emailAnswers) {
            entry = Object.assign(entry, emailAnswers);
            var entryIndex;
            
            //if new entry was based on defaults, 
            //we have an outdated entry to replace.
            if (defaults) {
                var oldIndex = addressBook.indexOf(defaults);
                addressBook.splice(oldIndex, 1, entry); //replace old with new
                entryIndex = oldIndex;
            }
            else {
                addressBook.push(entry);
                entryIndex = addressBook.length - 1;
            }

            //pass index of entry to the view function
            callback(null, entryIndex);            
        });
    });
}

///////////////////// __
//BUILDER FUNCTIONS//   \
/////////////////////   V

function buildInitialQuestions (defaults) {
    defaults = defaults || {};
    
    return  [
        {
            name: "firstName",
            message: "First name...",
            default: defaults.firstName
        },
        {
            name: "lastName",
            message: "Last name...",
            default: defaults.lastName
        },
        {
            name: "birthday",
            message: "Birth day (optional)...",
            default: defaults.birthday
        }
    ];
}

//customizes address questions based on user choices (home, work, other)
function buildAddressQuestions (addressTypes, defaults) {
    defaults = defaults || {};
    
    var genericAddressQuestions = [
        {
            name: "Line1",
            message: "address line 1..."
        },
        {
            name: "Line2",
            message: "address line 2... (optional)"
        },
        {
            name: "City",
            message: "city..."
        },
        {
            name: "Province",
            message: "province..."
        },
        {
            name: "PostalCode",
            message: "postal code..."
        },
        {
            name: "Country",
            message: "country..."
        }
    ];
    
    var addressQuestions = [];
    
    //for each selected address type (home, etc)...
    addressTypes.forEach( function (type) {
        //go through generic questions, concat type with property name
        //this makes the customized questions based on user input
        genericAddressQuestions.forEach( function (genericQuestion) {
            var newQuestion = {};
            
            newQuestion.name = type + genericQuestion.name;
            newQuestion.message = type + " " + genericQuestion.message;
            newQuestion.default = defaults[type + genericQuestion.name];
            
            addressQuestions.push(newQuestion);
        });
    });
    
    return addressQuestions;
}

//customizes questions about phone numbers based on user input
function buildPhoneQuestions (phoneTypes, defaults) {
    defaults = defaults || {};
    
    var genericPhoneQuestions = [
        {
            name: "Number",
            message: "phone number..."
        },
        {
            name: "PhoneType",
            message: "phone type...",
            type: "list",
            choices: ["landline", "mobile", "fax"]
        }
    ];
    
    var phoneQuestions = [];
    
    //for each selected type of phone number (home, etc)...
    phoneTypes.forEach( function (type) {
        //go through the generic questions to build the customized versions
        genericPhoneQuestions.forEach( function (genericQuestion) {
            var newQuestion = {};
            
            newQuestion.name = type + genericQuestion.name;
            newQuestion.message = type + " " + genericQuestion.message;
            newQuestion.default = defaults[type + genericQuestion.name];
            if (genericQuestion.type) newQuestion.type = genericQuestion.type;
            if (genericQuestion.choices) newQuestion.choices = genericQuestion.choices;
            
            phoneQuestions.push(newQuestion);
        });
    });
    
    return phoneQuestions;    
}

function buildEmailQuestions (emailTypes, defaults) {
    defaults = defaults || {};
    
    var genericEmailQuestions = {
        name: "Email",
        message: "email address...",
    };
    
    var emailQuestions = [];
    
    //for each selected type of phone number (home, etc)...
    emailTypes.forEach( function (type) {
        //go through the generic questions to build the customized versions
            var newQuestion = {};
            
            newQuestion.name = type + genericQuestion.name;
            newQuestion.message = type + " " + genericQuestion.message;
            newQuestion.default = defaults[type + genericQuestion.name];
            
            emailQuestions.push(newQuestion);
        });
    });    
    
    return emailQuestions;
}



/*********************************view*************************************/

var viewMenu = [
    {
        name: "viewChoice",
        message: "What would you like to do with this entry?",
        type: "list",
        choices: ["Edit", "Delete", "Go back to main menu"]
    },
    {
        name: "deleteConfirmation",
        message: "Are you sure you want to delete this entry?",
        type: "confirm",
        when: function (answers) {
            return answers.viewChoice === "Delete";
        }
    }
];

function view (index) {
    var table = new Table();
    
    var entry = addressBook[index];
    var keys = Object.keys(entry);
    
    //DON'T FORGET FOR LATER...
    //in the object.assign in create(), add properties like firstNameLabel
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
    
    inquirer.prompt(viewMenu, function (answers) {
         switch (answers.viewChoice) {
            case "Edit":
                create(entry);
                break;
            case "Delete":
                if (answers.deleteConfirmation === true) {
                    addressBook.splice(index, 1);
                    start();
                } else { 
                    view(index);
                }
                break;
            case "Go back to main menu":
                start();
                break;
         }
    });
}

/******************************search**************************************/
var searchMenu = {
        name: "query",
        message: "Enter the search terms..."
}

function search() {
    inquirer.prompt(searchMenu, function (answers) {
        //filter out matching entries
        var matches = addressBook.filter( function (person) {
            var keys = Object.keys(person);
            
            //returns true immediately if any property value in this person's
            //entry matches the search query
            return keys.some( function (key) {
                if (person[key].indexOf(answers.query) !== -1) {
                    return true; 
                }
                else {
                    return false;
                }
            });
        });
        
        
        
        var matchesMenu = {
            name: "matchesChoice",
            message: "Select a match...",
            type: "list",
            choices: []
        };
        
        //if there are matches...
        if (matches.length > 0) {
            //push their names into the list choices, prepended with the match index
            matches.forEach( function (match, index) {
                matchesMenu[0].choices.push(index + ". " + match.lastName + ", " + match.firstName);
            });
        }
        else matchesMenu[0].message = "No matches found.";
            
        matchesMenu[0].choices.push("Search again", "Back to main menu");
        
        inquirer.prompt(matchesMenu, function (answers) {
            switch (answers.matchesChoice) {
                case "Search again":
                    search();
                    break;
                case "Back to main menu":
                    start();
                    break;
                default:
                    var match = matches[answers.matchesChoice.charAt(0)];
                    var entryIndex = addressBook.indexOf(match);
                    
                    view(entryIndex);
                    break;
            }
        });
    });
}