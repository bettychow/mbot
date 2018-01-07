curl -X POST -H "Content-Type: application/json" -d '{
  "recipient":{
    "id":"862420310549694"
  },
  "message":{
    attachment: {
        type: "template",
        payload: {
            template_type: "generic",
            elements: [{
                title: "gal",
                subtitle: "Is this the celeb you are looking for?",
                image_url: "http://placehold.it/350x150",
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
  }
}' "https://graph.facebook.com/v2.6/me/messages?access_token=EAAFdfOUojVABAJ7hUto8dE4FTVBm3kQG6JsWbDp16O8VasUAb51NQqhKqbH8BJm5TrQhHA2wp35qZArTEVbLewr2iQXBW2AMYY4ZBuA2RI8AuHnhH2XrxPQTX4RG8ZCOZCQrqMZBuvgoyAbbpZBfy6ZCxycBESCMknIsClQmvA9sAZDZD"
