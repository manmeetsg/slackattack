# Manmeet Gujral Slack Attack

##GIT HUB REPO: 
https://github.com/manmeetsg/slackattack

##HEROKU URL:
manmeetslackattack.herokuapp.com
https://git.heroku.com/manmeetslackattack.git


##NOTES: 
- Please see the screenshots folder for my screenshots of the bot
- My bot replies to hi, hello, howdy, and hey as greetings __ONLY__ if they are the first thing in the message, otherwise it replies wondering what you said
- 'help' yields a description of what my bot does
- My bot holds a conversation for a food query when it sees the word 'food' in a message. It also sends the yelp results as an attachment.
- I set up Heroku correctly such that my bot wakes up when the dyno sleeps and wakes up when I message it in bots
- I found that the bot might fail to get the food if you query it too many times too fast. Not sure if thats a yelp thing or not, but it should perform perfectly fine. Check screenshots for reference.



