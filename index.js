const config = require('./config.json');

// Discord

const Discord = require('discord.js');
const kotori = new Discord.Client();
kotori.login(config.discord_token);

kotori.once('ready', () => {
    console.log('Kotori is connected to discord! ;V');
});

// Twitter

const Twitter = require('twitter');
const tweeter = new Twitter(config.twitter);

tweeter.stream('statuses/filter', { follow: config.user_id }, stream => {
    stream.on('data', tweet => {
        if (!tweet.retweeted_status && tweet.user.id_str === config.user_id) {
            if (tweet.in_reply_to_user_id) {
                if (tweet.in_reply_to_user_id_str !== config.user_id) {
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
        }
    });

    stream.on('error', error => {
        console.error(error);
    });
});
