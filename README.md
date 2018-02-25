# MBOT

This is a Facebook Messenger chatbot that allows user to get details of movies and celebrities.

1. user input movie name
- call processMessage

2. bot replies with generic template to confirm if it is the movie he wants
- buttons yes or no
- call processPostback

3. if user conform it's correct, bot asks user to get movie info
- text message Used
- call processPostback

4. if user enter a field say e.g. 'cast', bot will reply with generic template with celebs' names on button to ask user to click on button to get info about celeb
- call processPostback

5. bot will ask user to confirm if it is the celeb he wants by generic template

6. if user click yes, bot should return celeb's birthday and biography.


## Quick Start

## Technologies

- Node.js
- Express.js
- mongodb
- mongoose

#TODOS

[ ] Fix the double message sending bug
