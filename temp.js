function findCeleb(userId, celeb) {

  console.log('=====> celeb', celeb);

  let celebQuery = celeb.toLowerCase().split(' ').join('+');

  request(`https://api.themoviedb.org/3/search/person?api_key=7e4b27935bdf42e30eff3931dbeee374&query=${celebQuery}`, function (error, response, body) {
    if(!error) {
      var celebBody = JSON.parse(body)

      var celebObj = celebBody.results[0];

        console.log('bbbbbbbbbody', celebObj.profile_path);

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
                    image_url: `https://image.tmdb.org/t/p/w300${celebObj.profile_path}`,
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
          console.log('????????????????', message.attachment.payload.elements[0].title)
          sendMessage(userId, message);
        }

      });

    } else {
      sendMessage(userId, {text: celebObj.Error});
    }

  });



}

function getCelebDetail(userId, field) {

  Celeb.findOne({user_id: userId}, function(err, celeb) {
    var celebID = celeb["id"];

    request(`https://api.themoviedb.org/3/person/${celebID}?api_key=7e4b27935bdf42e30eff3931dbeee374`, function (error, response, body) {
    //  console.log('jjjjjjjjjjjj', body);

      var celebObj = JSON.parse(body);

      console.log('jjjjjjjjj', celebObj);
      var query = {user_id: userId};
      var update = {
        user_id: userId,
        birthday: celebObj.birthday,
        biography: celebObj.biography,
        homepage: celebObj.homepage
      };
      var options = {upsert: true};

      console.log('pppppppppp===>', update);

      Celeb.findOneAndUpdate(query, update, options, function(err, celeb) {
        if(err) {
          console.log("Database error: ", err);
        } else {
          sendMessage(userId, {text: celeb[field]});
        }
      });

    });
  });




}
