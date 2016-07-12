/* Manmeet Gujral, CS 52, HW 2 */
/* Heavily used the documentation for botkit, yelp api, and discussed
   with Alex Beals and Rajiv Ramaiah */

import botkit from 'botkit';
import Yelp from 'yelp';

// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM(err => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// Include the yelp API
const yelpControl = new Yelp({
  consumer_key: 'oI0IJ6CHB8XqZ15klhYacA',
  consumer_secret: process.env.consumer_secret,
  token: 'KVDbQ7JdE97FCIgevYp_gYuJt7MUhoPv',
  token_secret: process.env.token_secret,
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

// Wake up message
controller.on('outgoing_webhook', (bot, message) => {
  bot.replyPublic(message, 'Hey! I\'m up! I\'m up! http://tinyurl.com/h4uf5qz');
});


// Handle all other messages
controller.hears(['^((?!help|food|whats up|hello|hi|howdy|hey).)*$'],
['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  // Use ask and callback to code in simple conversation
  bot.reply(message, 'What does that mean? Use \'help\' to see what I do!');
});

// Handle the whats up? message
controller.hears(['whats up'], ['direct_message', 'direct_mention', 'mention'],
(bot, message) => {
  // Use ask and callback to code in simple conversation
  bot.reply(message, 'Oh, ya know, just robot things.');
});

// Handle the help message
controller.hears(['help'], ['direct_message', 'direct_mention', 'mention'],
(bot, message) => {
  // Use ask and callback to code in simple conversation
  bot.reply(message,
  'You can greet me, ask me for \'food\', or ask me \'whats up?\'');
});

// Hello response given by Tim T
controller.hears(['^hello', '^hi', '^howdy', '^hey'],
['direct_message', 'direct_mention', 'mention'],
(bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Hello, ${res.user.name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});

// Yelp food functions
/*
PLEASE NOTE
I DISCUSSED THIS PORTION OF THE CODE WITH ALEX BEALS AS HE IS QUITE EXPERIENCED
WITH JAVASCRIPT AND CALLBACKS AND I HAVE NEVER USED IT BEFORE
IF THE STRUCTURE IS SIMILAR, THIS IS WHY
*/
controller.hears(['food'], ['direct_message', 'direct_mention', 'mention'],
(bot, message) => {
  // call backs for the food search
  const pullResult = (res, con, resultList) => {
    if (resultList.length <= 0) {
      con.say('Sorry, no results are available.');
      con.next();
      return;
    }
    con.next();
    con.say('Here is your top result: ');
    con.next();
    con.say({
      attachments: [
        {
          title: `${resultList[0].name}`,
          image_url: resultList[0].image_url,
          text: resultList[0].snippet_text,
        },
      ],
      text: `${resultList[0].name}'s Rating: ${resultList[0].rating}`,
    });
    con.next();
  };

  const yelpQuery = (res, con, food, loc) => {
    // Search yelp with the search items and a sort by highest rated (2)
    yelpControl.search({ term: food, location: loc, sort: 2 })
    .then(data => {
      // Return the top business or handle more commands to get the next result
      pullResult(res, con, data.businesses);
      con.next();
    })
    .catch(err => {
      con.say('Something went wrong there. Try again by saying \'food\'!');
      con.next();
    });
  };

  // Food query takes the response, conversation, and location
  const foodQuery = (res, con, loc) => {
    con.ask('What would you like to eat?', (response, convo) => {
      // Yelp search for results here
      yelpQuery(response, convo, response.text, loc);
      convo.next();
    });
  };

  // Now ask for location
  const locationQuery = (res, con) => {
    con.ask('Where are you located?', (response, convo) => {
      convo.say('Great!');
      foodQuery(response, convo, response.text);
      convo.next();
    });
  };

  // Do you want food? structure copied from documentation
  // https://github.com/howdyai/botkit
  const initialQuery = (res, con) => {
    con.ask('Would you like food recommendations near you?', [
      {
        pattern: bot.utterances.yes,
        callback: (response, convo) => {
          convo.say('Ok, here we go!');
          locationQuery(response, convo);
          convo.next();
        },
      },
      {
        pattern: bot.utterances.no,
        callback: (response, convo) => {
          convo.say('Ok, then I won\'t show you any results');
          convo.next();
        },
      }]);
  };

  // Call the functions we need
  bot.startConversation(message, initialQuery);
});
