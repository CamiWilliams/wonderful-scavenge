// Alexa Fact Skill - Sample for Beginners
/* eslint no-use-before-define: 0 */
// sets up dependencies
const Alexa = require('ask-sdk');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

// core functionality for fact skill
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    let speechOutput = "";
    
    let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();

    if (Object.keys(persistentAttributes).length === 0) {
      persistentAttributes.today = getToday.call(this);
      persistentAttributes.items = "";
      persistentAttributes.points = 0;
      speechOutput = "Welcome to Wonderful Scavenge!  You have one day to find items around your town. How many items would you like to find today? Say, I want blank number of items";
    } else if (persistentAttributes.today === getYesterday.call(this)) {
      speechOutput = "Welcome to Wonderful Scavenge! You have one day to find items around your town. How many items would you like to find today? Say, I want blank number of items";
      persistentAttributes.today = getToday.call(this);
    } else {
      speechOutput = "Have you found " + persistentAttributes.items + "?";
    }

    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const ListItemsIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return (request.type === 'IntentRequest'
        && request.intent.name === 'ListItemsIntent');
  },
  async handle(handlerInput) {
    let numSpoken = handlerInput.requestEnvelope.request.intent.slots.numOfItems.value;
    if(!numSpoken) {
      numSpoken = 3;
    }
    let randomItemList = getRandomItems.call(this, numSpoken);
    let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    persistentAttributes.items = randomItemList;
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak("Great! Here are your " + numSpoken + " items to find today: " + randomItemList+ ". <say-as interpret-as='interjection'>good luck!</say-as>")
      .getResponse();
  },
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return (request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.YesIntent');
  },
  async handle(handlerInput) {
    let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    persistentAttributes.points += 1;
    persistentAttributes.items = "";
    let speechOutput = "<say-as interpret-as='interjection'>wahoo!</say-as> Congrats! You have " + persistentAttributes.points + " points! Come back soon for more items!";
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};

const NoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return (request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.NoIntent');
  },
  async handle(handlerInput) {
    let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    let speechOutput = "Go find " + persistentAttributes.items;
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};


const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Welcome to Wonderful Scavenge! How many items would you like to find today?")
      .reprompt("How many items would you like to find today?")
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Goodbye")
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    return handlerInput.responseBuilder
      .speak("There was an error!")
      .reprompt("There was an error!")
      .getResponse();
  },
};


const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ListItemsIntentHandler,
    HelpHandler,
    ExitHandler,
    YesIntentHandler,
    NoIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .withAutoCreateTable(true)
  .withTableName('wonderfulscavengeDB')
  .lambda();

// HELPER FUNCTIONS

function getRandomItems(num) {
  // the argument is an array [] of words or phrases
  let listOfItems = "";
  let counter = 0;
  while (counter < num) {
    const i = Math.floor(Math.random() * ITEMS.length);
    listOfItems += ITEMS[i] + " ";
    counter++;
  }
  return listOfItems;
}

function getToday() {
 let today = new Date();
 today.setHours(0,0,0,0);

 return today;
}

function getYesterday() {
  let today = getToday.call(this);
  let yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0,0,0,0);

  return yesterday;
}


// LIST OF ITEMS

const ITEMS = [
    "Chestnut",
    "Acorn",
    "Yellow Flower",
    "Orange Leaf",
    "Feather",
    "Red Berry",
    "Squash",
    "Carrot",
    "Apple",
    "Pumpkin",
    "Kidney Bean",
    "Cob of Corn",
    "Yellow Candle",
    "Brown Nail Polish",
    "Orange Jellybean",
    "Red Lipstick",
    "Candy wrapper",
    "Business Card",
    "Lego",
    "3 different colored pebbles",
    "Salt and pepper shakers",
    "Lip balm",
    "2 dollar bill",
    "Price tag",
    "Slinky",
    "Green crayon",
    "Mascara",
    "Cough drop",
    "Floss",
    "Pumpkin Pie Recipe",
    "Orange Garbage Bag",
    "Brown Egg",
    "Mustard",
    "Yellow Crayon",
    "Orange Balloon",
    "Outdoor Magazine",
    "Cinnamon Stick",
    "Button",
    "Rubber Band",
    "Keys",
    "Cereal prize",
    "Movie Ticket",
    "Blank Notebook",
    "Wire Hanger",
    "Pumpkin Seeds",
    "Puzzle",
    "Popsicle stick",
    "Greeting card",
    "Ketchup",
    "Compact Disc",
    "Napkin",
    "Battery",
    "Balloon",
    "Plastic fork",
    "Grocery receipt",
    "Used stamp",
    "Candle",
    "Paper grocery bag",
    "Can of pop",
    "Tea bag",
    "Magazine",
    "Potato",
    "Coupon",
    "Duct Tape",
    "Penny",
    "Spool of thread",
    "Coaster",
    "Dice",
    "Book",
    "Envelope",
    "Washcloth",
    "Pen from a dentist",
    "Fridge magnet",
    "Knife",
    "Christmas ornament",
    "Cookie cutter",
    "Magazine",
    "Deck of playing cards",
    "Travel toothpaste",
    "Company Water bottle",
    "Phone charger",
    "Yellow Apple",
    "Wodden Spoon",
    "Plastic bag",
    "Bar of Soap",
    "Disposable coffee cup",
    "Dog treat",
    "Cardboard Box",
    "Restaurant napkin",
    "Disposable toilet seat cover",
    "Receipt for 30 cents worth of gas",
    "Stranger’s autograph",
    "Fortune cookie",
    "Take-out menu from a chinese restaurant",
    "Pizza coupon",
    "Tooth Pick",
    "Toilet paper",
    "Photo frame",
    "Paper clip",
    "Purple Sock",
    "Stuffed bear"
  ];








