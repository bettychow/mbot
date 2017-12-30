'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');



const app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am Kitty');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {

	if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) {
		res.send(req.query['hub.challenge']);
	}
	res.send('Error, wrong token');
});

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});

// Handles messages events
function handleMessage(sender_psid, received_message) {

	let response;

	// Check if the message contains text
	if(received_message.text) {
		response = {
			"text": `You sent the message: "${received_message}". Now send me an image!`
		}
  } else if (received_message.attachments) {

		// Gets the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		response = {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"elements": [{
						"title": "Is this the right picture?",
						"subtitle": "Tap a button to answer.",
						"image_url":  attachment_url,
						"buttons": [
							{
								"type": "postback",
								"title": "Yes!",
								"payload": "yes",
							},
							{
								"type": "postback",
								"title": "No!",
								"payload": "no",
							}
						],
					}]
				}
			}
		}
	}

// Sends the response message
callSendAPI(sender_psid, response);

}


// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

  let payload = received_postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: "https://graph.facebook.com/v2.6/" + sender_psid,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        var name = bodyObj.first_name;
        greeting = "Hi " + name + ". ";
      }
      var message = greeting + "My name is Movies Q Bot. I can tell you various details regarding movies. What movie would you like to know about?";
      callSendAPI(sender_psid, {text: message});
     });
   }
		let response;
console.log('rrr', received_postback)
		// Get the payload for the postback
		// Set the response based on the postback payload
		if(payload === 'yes') {
			response = { "text": "Thanks!" }
		} else if(payload === 'no') {
			response = { "text": "Ooops, try sending another image." }
		}

		callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {

	// Construct the message body
	let request_body = {
		"recipient": {
			"id": sender_psid
		},
		"message": response
	}

	//Send the HTTP request to the Messenger Platform
	request({
		"url": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if(!err) {
			console.log('message.sent!');
		} else {
			console.error("Unable to send message:" + err);
		}
	});





}

// Creates the endpoint for Facebook webhook
app.post('/webhook/', (req, res) => {

	let body = req.body;

	if(body.object === 'page') {

		body.entry.forEach(function(entry) {
console.log('entry', entry)

			let webhook_event = entry.messaging[0];
		//	console.log('webhook_event', webhook_event);


			// Get the sender PSID
		  let sender_psid = webhook_event.sender.id;
		  console.log('Sender PSID: ' + sender_psid);

			// Check if the event is a message or postback and
	    // pass the event to the appropriate handler function
			if(webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);
			} else if(webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}
		});

		res.status(200).send('EVENT_RECEIVED');
	} else {
		res.sendStatus(404);
	}
});


//Add an API endpoint to process messages.

// app.post('/webhook/', (req,res) => {
// 	let messagingEvents = req.body.entry[0].messaging;
// 	for(let i = 0; i <messagingEvents.length; i++) {
// 		let event = messagingEvents[i];
// 		let sender = event.sender.id;
//
// 		if(event.message && event.message.text) {
// 			let text = event.message.text;
// 			console.log('text', text);
// 			sendTextMessage(sender, "Text received, echo: " + text.substing(0, 200));
// 		}
// 	}
// 	res.sendStatus(200);
// });


//const token = "EAAFdfOUojVABAMka3jZAw7ydGBHZBf7gH1xqCYehq3OF3mGtndpsYahQCWPAlraDqLXMaDFIHot45EBI2SBWlWI7XbmXr1sTVNmPy0Lo7Yrkn2dbi7bZA3ySwnZAlezzVOxZAavXZBqDTF80HCW1l5b3T5Ro4Va7aaYs52IOqy9QZDZD"
