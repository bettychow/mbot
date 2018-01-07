var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var db = mongoose.connect("mongodb://heroku_qdhdtqh8:cr4804gtf8u2iijjtkp936cnsq@ds133557.mlab.com:33557/heroku_qdhdtqh8");
var Movie = require("./models/movie");
var Celeb = require("./models/celeb");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
    res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
    if (req.query["hub.verify_token"] === 'my_voice_is_my_password_verify_me') {
        console.log("Verified webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("Verification failed. The tokens do not match.");
        res.sendStatus(403);
    }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
	console.log('bbb', req.body)
    // Make sure this is a page subscription
    if (req.body.object === "page") {
        // Iterate over each entry
        // There may be multiple entries if batched
        req.body.entry.forEach(function(entry) {
            if (entry.messaging) {
                console.log('\n\n MESSAGING ENTRY HERE:', entry.messaging)
                // Iterate over each messaging event
                entry.messaging.forEach(function(event) {
                    if (event.postback) {
                        processPostback(event);
                    } else if (event.message) {
                        processMessage(event);
                    }
                });
            }

            if (entry.standby) {
                console.log('\n\nSTANDBY ENTRY HERE:', entry.standby)
                entry.standby.forEach(function(event) {
                    if (event.postback) {
                        processPostback(event);
                    } else if (event.message) {
                        processMessage(event);
                    }
              });
            }
    });

    res.sendStatus(200);
  }
});

function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload || event.postback.title;

    console.log('PAYLOAD', event.postback.payload);
    console.log('TITLE', event.postback.title);

    if (payload === "Greeting") {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: "EAAFdfOUojVABAMka3jZAw7ydGBHZBf7gH1xqCYehq3OF3mGtndpsYahQCWPAlraDqLXMaDFIHot45EBI2SBWlWI7XbmXr1sTVNmPy0Lo7Yrkn2dbi7bZA3ySwnZAlezzVOxZAavXZBqDTF80HCW1l5b3T5Ro4Va7aaYs52IOqy9QZDZD",
                fields: "first_name"
            },
            method: "GET"
        }, function(error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name: " +  error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi " + name + ". ";
            }
            var message = greeting + "My name is SP Movie Bot. I can tell you various details regarding movies. What movie would you like to know about?";
            sendMessage(senderId, {text: message});
        });
    } else if (payload === "Correct") {
        sendMessage(senderId, {text: "Awesome! What would you like to find out? Enter 'plot', 'date', 'runtime', 'director', 'cast' or 'rating' for the various details."});
    } else if (payload === "Incorrect") {
        sendMessage(senderId, {text: "Oops! Sorry about that. Try using the exact title of the movie"});
    } else if(payload === "Get other info") {
        sendMessage(senderId, {text: "Awesome! What would you like to find out? Enter 'plot', 'date', 'runtime', 'director', 'cast' or 'rating' for the various details."});
    } else if (event.postback.title !== "Yes") {
        findCeleb(senderId, payload);
    } else {
      sendMessage(senderId, {text: "Broken"})
    }
}

function processMessage(event) {
    if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;

        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));

        // You may get a text or attachment but not both
        if (message.text) {
            var formattedMsg = message.text.toLowerCase().trim();

            // If we receive a text message, check to see if it matches any special
            // keywords and send back the corresponding movie detail.
            // Otherwise search for new movie.
            switch (formattedMsg) {
                case "plot":
                case "date":
                case "runtime":
                case "director":
                case "cast":
                case "rating":
                    getMovieDetail(senderId, formattedMsg);
                    break;

                default:
                    findMovie(senderId, formattedMsg);
            }
        } else if (message.attachments) {
            sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        }
    }
}

function findMovie(userId, movieTitle) {
    request("http://www.omdbapi.com/?i=tt3896198&apikey=11ddc4c0&type=movie&t=" + movieTitle, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var movieObj = JSON.parse(body);
            console.log('=======', movieObj);
            if (movieObj.Response === "True") {
                var query = {user_id: userId};
                var update = {
                    user_id: userId,
                    title: movieObj.Title,
                    plot: movieObj.Plot,
                    date: movieObj.Released,
                    runtime: movieObj.Runtime,
                    director: movieObj.Director,
                    cast: movieObj.Actors,
                    rating: movieObj.imdbRating,
                    poster_url:movieObj.Poster
                };
                var options = {upsert: true};
                Movie.findOneAndUpdate(query, update, options, function(err, mov) {
                    if (err) {
                        console.log("Database error: " + err);
                    } else {
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [
                                        {
                                        "title": movieObj.Title,
                                        "image_url": movieObj.Poster === "N/A" ? "http://placehold.it/350x150" : movieObj.Poster,
                                        "subtitle": "Is this the movie you are looking for?",
                                        "buttons": [{
                                            "type": "postback",
                                            "title": "Yes",
                                            "payload": "Correct"
                                        }, {
                                            "type": "postback",
                                            "title": "No",
                                            "payload": "Incorrect"
                                        }]
                                    }]
                                }
                            }
                        };
												console.log('mmmm', message)
                        sendMessage(userId, message);
                    }
                });
            } else {
                console.log(movieObj.Error);
                sendMessage(userId, {text: movieObj.Error});
            }
        } else {
            sendMessage(userId, {text: "Something went wrong. Try again."});
        }
    });
}

function getMovieDetail(userId, field) {
    Movie.findOne({user_id: userId}, function(err, movie) {
        if(err) {
            sendMessage(userId, {text: "Something went wrong. Try again"});
        } else {
					console.log('ffff', movie[field]);
          console.log('xxxxxxxxx', movie);

					if(field === 'cast') {
						let cast = movie[field].split(", ");
						let castData = cast.map(celeb => {
							return {type: "celeb", name: celeb}
						});
						console.log('ddddddddddd', cast)
            var message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": movie.title,
                            "subtitle": "Cast. Click on the celeb's name to know more",
                            "buttons": []
                        }]
                    }
                }
            };

                     let buttons = message.attachment.payload.elements[0].buttons


                     for(let i = 0; i < 2; i++) {
            					let celeb = {
            					  type: "postback",
            				  	title: cast[i],
            				  	payload: cast[i]
                      }

            					buttons.push(celeb);
                     }

                     buttons.push(
                       {
             					  type: "postback",
             				  	title: "Get other info",
             				  	payload: "Get other info"
                       }
                     )

                     console.log('++++++++++', message.attachment.payload.elements[0].buttons)
          }
      sendMessage(userId, message);
    }
  });
}


function findCeleb(userId, celeb) {

  console.log('=====> celeb', celeb);

  let celebQuery = celeb.toLowerCase().split(' ').join('+');

  request(`https://api.themoviedb.org/3/search/person?api_key=7e4b27935bdf42e30eff3931dbeee374&query=${celebQuery}`, function (error, response, body) {
    if(!error) {
      var celebBody = JSON.parse(body)

      var celebObj = celebBody.results[0];

        console.log('bbbbbbbbbody', celebObj.name);

      var query = {user_id: userId};
      var update = {
        user_id: userId,
        name: celebObj.name,
        id: celebObj.id,
        known_for: celebObj.known_for,
        pic_url: celebObj.profile_path,
        popularity: celebObj.popularity
      };
      var options = {upsert: true};
      Celeb.findOneAndUpdate(query, update, options, function(err, celeb) {
        if (err) {
    console.log("Database error: " + err);
        } else {
          var message = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [{
                    title: celebObj.name,
                    subtitle: "Is this the celeb you are looking for?",
                    image_url: celebObj.profile_path === "N/A" ? "http://placehold.it/350x150" : celebObj.profile_path,
                    buttons: [{
                        type: "postback",
                        title: "Yes",
                        payload: "Yes"
                    }, {
                        type: "postback",
                        title: "No",
                        payload: "No"
                  }]
                }]
              }
            }
          };
          console.log('????????????????', message.attachment.payload.elements[0].buttons)
          sendMessage(userId, message);
        }

      });

    } else {
      sendMessage(userId, {text: celebObj.Error});
    }

  });

  request("https://api.themoviedb.org/3/person/6193?api_key=7e4b27935bdf42e30eff3931dbeee374", function (error, response, body) {

  });


}

// sends message to user
function sendMessage(recipientId, message) {
	//console.log('kkk', message.attachment.payload.elements)
	console.log('hhh', recipientId)
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: "EAAFdfOUojVABAJ7hUto8dE4FTVBm3kQG6JsWbDp16O8VasUAb51NQqhKqbH8BJm5TrQhHA2wp35qZArTEVbLewr2iQXBW2AMYY4ZBuA2RI8AuHnhH2XrxPQTX4RG8ZCOZCQrqMZBuvgoyAbbpZBfy6ZCxycBESCMknIsClQmvA9sAZDZD"},
        method: "POST",
        json: {
            recipient: {
                id: recipientId
            },
            message: message,
        }
    }, function(error, response, body) {
        console.log('WHAT DOES FACEBOOK SERVER SAY')
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}
