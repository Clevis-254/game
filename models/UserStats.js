import mongoose from 'mongoose';

const UserStatsSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timePlayed: {
    type: Number,
    default: 0,
  },
  pathChoices: {
    left: { type: Number, default: 0 },
    right: { type: Number, default: 0 }
  },
  numberOfDeaths: {
    type: Number,
    default: 0,
  },
  riddleGuesses: {
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 }
  },
  audioFiles: {
    hit: { type: Number, default: 0 },
    miss: { type: Number, default: 0 },
    stamina: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 },
    eating: { type: Number, default: 0 },
    death: { type: Number, default: 0 }
  },
  commands: {
    startGame: { type: Number, default: 0 },
    pause: { type: Number, default: 0 },
    repeat: { type: Number, default: 0 },
    endGame: { type: Number, default: 0 },
    speedUp: { type: Number, default: 0 },
    slowDown: { type: Number, default: 0 },
    restart: { type: Number, default: 0 },
    clear: { type: Number, default: 0 },
    rewind: { type: Number, default: 0 },
    help: { type: Number, default: 0 }
  },
  heatmap: {
    forestObstacle: { type: Number, default: 0 },
    forestFight: { type: Number, default: 0 },
    riddle: { type: Number, default: 0 },
    boss: { type: Number, default: 0 }
  }
});

// Calculates total number of audio files played and stores it as a virtual field.
UserStatsSchema.virtual('totalAudioPlayed').get(function() {
  return Object.values(this.audioFiles).reduce((total, count) => total + count, 0);
});

// Calculates total number of riddle guesses and stores it as a virtual field.
UserStatsSchema.virtual('totalRiddleGuesses').get(function() {
  return Object.values(this.riddleGuesses).reduce((total, count) => total + count, 0);
});

// Calculates total number of path choices and stores it as a virtual field.
UserStatsSchema.virtual('totalPathChoices').get(function() {
  return Object.values(this.pathChoices).reduce((total, count) => total + count, 0);
});

const UserStats = mongoose.model('UserStats', UserStatsSchema);
export default UserStats;
