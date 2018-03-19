# MBOT

This is a Facebook Messenger chatbot that interact with users and provide details of movies and celebrities upon queries by users.

1. User inputs movie's name
- call processMessage

2. Chatbot replies with generic template to confirm if it is the movie he/she wants
- buttons yes or no
- call processPostback

3. If user conforms it's correct, chatbot asks user if he/she wants to get movie info
- text message Used
- call processPostback

4. If user enter a field say e.g. 'cast', chatbot will reply with generic template with celebs' names on button, and ask user to click on button to get info about celeb
- call processPostback

5. Chatbot will ask user to confirm if it is the celeb he/she wants by generic template

6. If user click yes, bot should return celeb's birthday and biography.


## Quick Start

## Technologies

- Node.js
- Express.js
- mongodb
- mongoose

