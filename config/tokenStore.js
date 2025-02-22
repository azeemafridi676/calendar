const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, '..', 'tokens.json');

// Initialize tokens from file or create new file
const initializeTokens = () => {
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
            return tokens;
        }
    } catch (error) {
        console.error('Error reading tokens:', error);
    }
    return null;
};

// Save tokens to file
const saveTokens = (tokens) => {
    try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        return true;
    } catch (error) {
        console.error('Error saving tokens:', error);
        return false;
    }
};

// Get stored tokens
const getStoredTokens = () => {
    return initializeTokens();
};

module.exports = {
    saveTokens,
    getStoredTokens
}; 