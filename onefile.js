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
                //search();
                break;
            case 'Quit':
                console.log("Goodbye!");
                break;
        }
    });
}

//start the program
start();

/******************************create.js**************************************/

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

var emailQuestions = [
    {
        name: "emailTypes",
        message: "Types of email...",
        type: "checkbox",
        choices: ["home", "work", "other"]
    },
    {
        name: "homeEmail",
        message: "Home email address...",
        when: function (answers) {
            return answers.emailTypes.indexOf("home") !== -1;
        }
    },
    {
        name: "workEmail",
        message: "Work email address...",
        when: function (answers) {
            return answers.emailTypes.indexOf("work") !== -1;
        }
    },
    {
        name: "otherEmail",
        message: "Other email address...",
        when: function (answers) {
            return answers.emailTypes.indexOf("other") !== -1;
        }
    }
];

//run functions in sequence, passing result from previous to next function
//reference to mainMenu function also passed to last function in the sequence
function  create (defaults) {
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
        choices: ["home", "work", "other"]
    }
    
    //prompt the user about which types of addresses they want to add
    inquirer.prompt(typeQuestion, function (typeAnswers) {
        var addressTypes = typeAnswers.addressTypes;
        var addressQuestions = buildAddressQuestions(addressTypes, defaults);
        
        //prompt user for address details using customized address questions
        inquirer.prompt(addressQuestions, function (addressAnswers) {
            //for each selected address type, copy details to entry
            addressTypes.forEach( function (type) {
                entry = Object.assign(entry, addressAnswers);
            });
            
            callback(null, entry, defaults);
        });         
    });
}

function makePhones (entry, defaults, callback) {
    var typeQuestion = {
        name: "phoneTypes",
        message: "Types of phone numbers...",
        type: "checkbox",
        choices: ["home", "work", "other"]
    } 
    
    //prompt the user about which types of phone numbers they want to add
    inquirer.prompt(typeQuestion, function (typeAnswers) {
        var phoneTypes = typeAnswers.phoneTypes;
        var phoneQuestions = buildPhoneQuestions(phoneTypes, defaults);
        
        //prompt user for phone numbers using customized questions
        inquirer.prompt(phoneQuestions, function (phoneAnswers) {
            //for each selected type of phone number, copy details into entry
            phoneTypes.forEach( function (type) {
                entry = Object.assign(entry, phoneAnswers);
            });
            
            callback(null, entry, defaults);
        });              
    });
}

function makeEmails (entry, defaults, callback) {
    inquirer.prompt(emailQuestions, function (emailAnswers) {
        delete emailAnswers.emailTypes;
        
        entry = Object.assign(entry, emailAnswers);
        addressBook.push(entry);
        
        var entryIndex = addressBook.length - 1;
        callback(null, entryIndex);
    });   
}

///////////////////// __
//BUILDER FUNCTIONS//   |
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
            message: "address line 1...",
        },
        {
            name: "Line2",
            message: "address line 2... (optional)",
        },
        {
            name: "City",
            message: "city...",
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



/*********************************view.js*************************************/

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
            
        }
    }
];

function view (index) {
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
    
    inquirer.prompt(viewMenu, function (answers) {
         switch (answers.viewChoice) {
            case "Edit":
                 
            case "Delete":
                
            case "Go back to main menu":
                start();
                break;
         }
    });
}