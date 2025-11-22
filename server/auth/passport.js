const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// In-memory store for Broadcaster Token (needed to check moderators)
let broadcasterToken = null;
let broadcasterId = null;

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    callbackURL: process.env.TWITCH_REDIRECT_URI,
    state: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 1. Get User Info
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const user = userResponse.data.data[0];
        const channelName = process.env.TWITCH_CHANNEL_NAME?.toLowerCase();

        let role = 'viewer';

        // 2. Check if Broadcaster
        if (user.login.toLowerCase() === channelName) {
            role = 'broadcaster';
            broadcasterToken = accessToken; // Save token to check mods later
            broadcasterId = user.id;
            console.log('👑 Broadcaster logged in. Token saved.');
        } else {
            // 3. Check if Moderator
            // We need the Broadcaster's token to check the moderator list via API
            if (broadcasterToken && broadcasterId) {
                try {
                    const modResponse = await axios.get('https://api.twitch.tv/helix/moderation/moderators', {
                        headers: {
                            'Client-ID': process.env.TWITCH_CLIENT_ID,
                            'Authorization': `Bearer ${broadcasterToken}`
                        },
                        params: {
                            broadcaster_id: broadcasterId,
                            user_id: user.id
                        }
                    });

                    if (modResponse.data.data.length > 0) {
                        role = 'moderator';
                    }
                } catch (err) {
                    console.error('Error checking moderator status:', err.response?.data || err.message);
                }
            } else {
                console.warn('⚠️ Broadcaster has not logged in yet. Cannot verify moderator status.');
            }
        }

        // 4. Create User Object
        const userData = {
            id: user.id,
            login: user.login,
            display_name: user.display_name,
            profile_image_url: user.profile_image_url,
            role
        };

        return done(null, userData);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;
