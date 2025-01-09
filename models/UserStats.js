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
  gameCompletions: {
    type: Number,
    default: 0,
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
    inputNotification: { type: Number, default: 0 },
    hit: { type: Number, default: 0 },
    death: { type: Number, default: 0 },
    intro: { type: Number, default: 0 },
    forestIntro: { type: Number, default: 0 },
    forestFight: { type: Number, default: 0 },
    battleMusic: { type: Number, default: 0 },
    forestObstacle: { type: Number, default: 0 },
    riddleIntro: { type: Number, default: 0 },
    notHere: { type: Number, default: 0 },
    ahRiddle: { type: Number, default: 0 },
    riddle: { type: Number, default: 0 },
    openDoor: { type: Number, default: 0 },
    finale: { type: Number, default: 0 },
    ending: { type: Number, default: 0 }
  },
  commands: {
    startGame: { type: Number, default: 0 },
    pause: { type: Number, default: 0 },
    play: { type: Number, default: 0 },
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
    forestFight: { type: Number, default: 0 },
    forestObstacle: { type: Number, default: 0 },
    riddle: { type: Number, default: 0 },
    boss: { type: Number, default: 0 }
  }
}, {
  toJSON: { virtuals: true } // Sends the virtual fields when JSON is fetched
});

// Calculates total number of audio files played and stores it as a virtual field.
UserStatsSchema.virtual('totalAudioPlayed').get(function() {
  return Object.values(this.audioFiles).reduce((total, count) => total + count, 0);
});

// Calculates total number of commands used and stores it as a virtual field.
UserStatsSchema.virtual('totalCommandsUsed').get(function() {
  return Object.values(this.commands).reduce((total, count) => total + count, 0);
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
