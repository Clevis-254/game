import Sentiment from 'sentiment';

// Create a new instance of the Sentiment class
const sentiment = new Sentiment();

// Predefined commands that the NLP model can recognize
const predefinedCommands = {
    "start game": ["play game", "begin game", "initiate game"],
    "end game": ["stop game", "terminate game"],
    "restart": ["reset game", "start over"],
    "clear": ["clear console", "erase history"],
    "pause": ["pause dialogue", "hold dialogue"],
    "play": ["resume dialogue", "continue dialogue"],
    "speed up": ["increase speed", "fast forward"],
    "slow down": ["decrease speed", "slow motion"],
    "rewind": ["go back", "reverse"],
    "left": ["move left", "turn left"],
    "right": ["move right", "turn right"]
};

// Analyze the sentiment of the input text
export const analyzeSentiment = (text) => {
    const result = sentiment.analyze(text);
    console.log('Sentiment Score:', result.score);
    // You can use the sentiment score to update the UI or take other actions
};

// Analyze the input text and find the best matching command
export const correctInput = async (input) => {
    const response = await fetch('/api/nlp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, commands: predefinedCommands }),
    });
    const data = await response.json();
    return data.bestCommand || input;
};

// Cleanse the text by converting it to lowercase and removing special characters
export const cleanseText = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
};
