import mongoose from 'mongoose'

const _consoleLogHistory = new mongoose.Schema(
    {
    Messages : [
        {MessageID : Number,
        Message : String,
        Speaker : String,
        GameID : Number
        }
    ],
    UserID : Number
}
);
// UserID is to link the chat history to the appropriate user
// Message ID is simply for indexing in order.
// Game_ID is there if we potentially link each line of dialogue to an ID for replay / stat purposes.

// Not sure why it says "virtuals" isn't spelt correctly that's copied off the docs
//_consoleLogHistory.set('toJSON', { virtuals: true });

const consoleLogHistorySchema = mongoose.model('consoleLogHistory', _consoleLogHistory);
export default consoleLogHistorySchema;