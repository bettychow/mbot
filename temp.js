function getMovieDetail(userId, field) {
    Movie.findOne({user_id: userId}, function(err, movie) {
        if(err) {
            sendMessage(userId, {text: "Something went wrong. Try again"});
        } else {
					console.log('ffff', movie[field]);

					if(field === 'cast') {
						let cast = movie[field].split(", ");
						let castData = cast.map(celeb => {
							return {type: "celeb", name: celeb}
						});
						console.log('ddd', castData)
						message = {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: movie.title,
                            subtitle: "Cast",
                            buttons: []
                        }]
                    }
                }
            };
console.log(message.attachment.payload.elements[0].buttons)

         let buttons = message.attachment.payload.elements[0].buttons


         for(let i = 0; i < castData.length; i++) {
					let celeb = {
					  type: "postback",
				  	title: castData[i].name,
				  	payload: castData[i].name
          }

					buttons.push(celeb);
         }

			 console.log('llll', message)
            sendMessage(userId, message);
      }
    }
  });
}
