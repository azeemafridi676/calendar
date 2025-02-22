const { google } = require('googleapis');
const { getStoredTokens } = require('./tokenStore');

// These values will come from Google Cloud Console
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Set credentials if they exist
const tokens = getStoredTokens();
if (tokens) {
    oauth2Client.setCredentials(tokens);
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

module.exports = { oauth2Client, calendar }; 