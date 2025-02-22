const { oauth2Client, calendar } = require('../config/googleCalendar');
const { saveTokens, getStoredTokens } = require('../config/tokenStore');
const { google } = require('googleapis');

const getAuthUrl = (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    res.json({ authUrl });
};

const getEvents = async (req, res) => {
    try {
        // Check if we have stored tokens
        const tokens = getStoredTokens();
        if (!tokens) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authenticated',
                authUrl: oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
                })
            });
        }

        // Get today's date at start of day in UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Get events for next 30 days (you can adjust this number)
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 30);
        futureDate.setUTCHours(23, 59, 59, 999);

        console.log('Fetching events between:', today.toISOString(), 'and', futureDate.toISOString());

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: today.toISOString(),
            timeMax: futureDate.toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
            showDeleted: false,
            timeZone: 'UTC'
        });

        const events = response.data.items || [];
        
        const formattedEvents = events.map(event => {
            const startDate = event.start?.dateTime || event.start?.date || null;
            const eventDate = new Date(startDate);
            
            return {
                id: event.id,
                title: event.summary || 'No Title',
                startTime: startDate,
                endTime: event.end?.dateTime || event.end?.date || null,
                description: event.description || '',
                location: event.location || '',
                status: event.status,
                isToday: eventDate.toDateString() === today.toDateString(),
                dayOfEvent: eventDate.toDateString(),
                creator: event.creator?.email || '',
                attendees: event.attendees || []
            };
        });

        // Group events by date
        const groupedEvents = formattedEvents.reduce((acc, event) => {
            const date = event.dayOfEvent;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {});

        res.json({ 
            success: true, 
            totalEvents: formattedEvents.length,
            currentDate: today.toDateString(),
            dateRange: {
                start: today.toDateString(),
                end: futureDate.toDateString()
            },
            eventsByDate: groupedEvents,
            allEvents: formattedEvents
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        
        // Handle token expiration
        if (error.code === 401) {
            try {
                const tokens = await oauth2Client.refreshToken(getStoredTokens().refresh_token);
                oauth2Client.setCredentials(tokens);
                saveTokens(tokens);
                // Retry the request
                return getEvents(req, res);
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                return res.status(401).json({ 
                    success: false, 
                    error: 'Authentication expired',
                    authUrl: oauth2Client.generateAuthUrl({
                        access_type: 'offline',
                        scope: ['https://www.googleapis.com/auth/calendar.readonly'],
                    })
                });
            }
        }

        res.json({ 
            success: false, 
            totalEvents: 0,
            currentDate: new Date().toDateString(),
            eventsByDate: {},
            allEvents: [],
            message: "No events found"
        });
    }
};

const handleCallback = async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // Store tokens securely
        saveTokens(tokens);
        
        // Redirect back to the main page
        res.redirect('/');
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to authenticate',
            details: error.message
        });
    }
};

module.exports = {
    getAuthUrl,
    getEvents,
    handleCallback
}; 