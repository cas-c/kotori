const config = require('./config.json');
const Twitter = require('twitter');
const tweeter = new Twitter(config.twitter);

tweeter.stream('statuses/filter', { follow: config.user_id }, stream => {
    console.log('connected to stream');
    stream.on('data', tweet => {
        if (!tweet.retweeted_status) {
            console.log(tweet);
        }
    });

    stream.on('error', error => {
        console.error(error);
    });
});
