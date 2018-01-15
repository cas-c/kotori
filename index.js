const config = require('./config.json');

function timeStamp() {
  var now = new Date();
  var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
  var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
  for (var i = 1; i < 3; i++) {
    if (time[i] < 10) {
      time[i] = "0" + time[i];
    }
  }
  return date.join("/") + " " + time.join(":");
}

// Discord

const Discord = require('discord.js');
const kotori = new Discord.Client();
kotori.login(config.discord_token);

kotori.once('ready', () => {
    console.log('Kotori is connected to discord! ;V');
    console.log("Current time is " + timeStamp());
});

// Twitter

const Twitter = require('twitter');
const tweeter = new Twitter(config.twitter);

tweeter.stream('statuses/filter', { follow: config.user_id }, stream => {
    stream.on('data', tweet => {
        console.log("New tweet incoming - " + timeStamp());
        if (tweet.user.id_str === config.user_id) {
            console.log("Sanity check passed");
        }
        else {
            console.log("Sanity check failed?");
        }
        if (!tweet.retweeted_status && tweet.user.id_str === config.user_id) {
            if (tweet.in_reply_to_user_id) {
                console.log("Tweet is a reply to " + tweet.in_reply_to_user_id);
                if (tweet.in_reply_to_user_id_str !== config.user_id) {
                    console.log("Tweet was NOT posted in Discord\n");
                    return;
                }
            }
            const reply = new Discord.RichEmbed()
                .setDescription(tweet.text + `\n\n\n [view tweet](https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str})`)
                .setAuthor(tweet.user.name)
                .setColor('#84c08b')
                .setTimestamp(new Date(tweet.created_at))
                .setThumbnail(tweet.user.profile_image_url_https)
                .setFooter(`@${tweet.user.screen_name} `, tweet.user.profile_image_url_https);
            if (tweet.entities.media) {
                reply.setImage(tweet.entities.media[0].media_url_https)
            }
            kotori.channels.get(config.channel_id).send(reply);
            console.log("Tweet was posted in Discord (probably!!)\n");
        }
        else {
            console.log("Tweet was a retweet or a reply from another user\n");
        }
    });

    stream.on('error', error => {
        console.log(error);
        console.log(timeStamp());
    });
});
