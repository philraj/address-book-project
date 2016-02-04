var inquirer = require("inquirer");
var async = require("async");
var addressBook = require("./addressBook.js")

module.exports = create;

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


var initialQuestions = [
    {
        name: "firstName",
        message: "First name..."
    },
    {
        name: "lastName",
        message: "Last name..."
    },
    {
        name: "birthday",
        message: "Birth day (optional)..."
    }
]

//generic questions to be used by buildAddressQuestions()
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
]

//to be used by buildPhoneQuestions()
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
]

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
//reference to showMenu function also passed to last function in the sequence
function  create (showMenu) {
    async.waterfall( [
        makeEntry,
        makeAddresses,
        makePhones,
        async.apply(makeEmails, showMenu)
    ],
        function () {
            console.log(addressBook);
        }
    );
}



function makeEntry (callback) {
    inquirer.prompt(initialQuestions, function (initialAnswers) {
        var entry = Object.assign({}, initialAnswers);
        
        callback(null, entry);
    });
}

function makeAddresses (entry, callback) {
    var typeQuestion = {
        name: "addressTypes",
        message: "Types of addresses...",
        type: "checkbox",
        choices: ["home", "work", "other"]
    }
    
    //prompt the user about which types of addresses they want to add
    inquirer.prompt(typeQuestion, function (typeAnswers) {
        var addressTypes = typeAnswers.addressTypes;
        var addressQuestions = buildAddressQuestions(addressTypes);
        
        //prompt user for address details using customized address questions
        inquirer.prompt(addressQuestions, function (addressAnswers) {
            //for each selected address type, copy details to entry
            addressTypes.forEach( function (type) {
                entry = Object.assign(entry, addressAnswers);
            });
            
            callback(null, entry);
        });         
    });
       
}

function makePhones (entry, callback) {
    var typeQuestion = {
        name: "phoneTypes",
        message: "Types of phone numbers...",
        type: "checkbox",
        choices: ["home", "work", "other"]
    } 
    
    //prompt the user about which types of phone numbers they want to add
    inquirer.prompt(typeQuestion, function (typeAnswers) {
        var phoneTypes = typeAnswers.phoneTypes;
        var phoneQuestions = buildPhoneQuestions(phoneTypes);
        
        //prompt user for phone numbers using customized questions
        inquirer.prompt(phoneQuestions, function (phoneAnswers) {
            //for each selected type of phone number, copy details into entry
            phoneTypes.forEach( function (type) {
                entry = Object.assign(entry, phoneAnswers);
            });
            
            callback(null, entry);
        });              
    });
}

function makeEmails (entry, callback) {
    inquirer.prompt(emailQuestions, function (emailAnswers) {
        delete emailAnswers.emailTypes;
        entry = Object.assign(entry, emailAnswers);
        
        addressBook.push(entry);
        callback(null);
    });   
}

///////////////////// __
//BUILDER FUNCTIONS//   |
/////////////////////   V

//customizes address questions based on user choices (home, work, other)
function buildAddressQuestions (addressTypes) {
    var addressQuestions = [];
    
    //for each selected address type (home, etc)...
    addressTypes.forEach( function (type) {
        //go through generic questions, concat type with property name
        //this makes the customized questions based on user input
        genericAddressQuestions.forEach( function (genericQuestion) {
            var newQuestion = {};
            
            newQuestion.name = type + genericQuestion.name;
            newQuestion.message = type + " " + genericQuestion.message;
            
            addressQuestions.push(newQuestion);
        });
    });
    
    return addressQuestions;
}

//customizes questions about phone numbers based on user input
function buildPhoneQuestions (phoneTypes) {
    var phoneQuestions = [];
    
    //for each selected type of phone number (home, etc)...
    phoneTypes.forEach( function (type) {
        //go through the generic questions to build the customized versions
        genericPhoneQuestions.forEach( function (genericQuestion) {
            var newQuestion = {};
            
            newQuestion.name = type + genericQuestion.name;
            newQuestion.message = type + " " + genericQuestion.message;
            if (genericQuestion.type) newQuestion.type = genericQuestion.type;
            if (genericQuestion.choices) newQuestion.choices = genericQuestion.choices;
            
            phoneQuestions.push(newQuestion);
        });
    });
    
    return phoneQuestions;    
}

