const tmi = require('tmi.js');
require('dotenv').config();

const client = new tmi.Client({
    options: { debug: true },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: process.env.TWITCH_OAUTH_TOKEN ? {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    } : undefined,
    channels: [process.env.TWITCH_CHANNEL || 'razhelok']
});

module.exports = client;