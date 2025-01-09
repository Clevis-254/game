import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'vite';
import consoleLogHistorySchema from "./models/consoleLogHistory.js";
import UserStats from "./models/UserStats.js";
import bodyParser from "body-parser";
import session from 'express-session';
import bcrypt, { compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import User from './models/UserSchema.js';
import error from "express/lib/view.js";
import path from "path";
import {redirect} from "react-router-dom";


const app = express();

//  middleware configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const vite = await createServer({
    server: {
        middlewareMode: true,
    },
    appType: 'custom',
});

app.use(session({
    secret: 'c5afbf2a6d07b53a8ac4f3ac154d2138bf4a89a39037d8caf47db0ed6d8469e08b94644a1c9d47852fe7ac9939bbaec7c8c7a23113c8a824cd27b6e0912b7804',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false,
        httpOnly: true
    }
}));

const dbURI = "mongodb+srv://Admin_1:lLrnAwIbvkI7Hgj9@clustergroup8.o6myn.mongodb.net/dev";  // Added /dev to create dev database

// Database initialization function
async function initializeDatabase() {
    try {
        // Connect to MongoDB with dev database
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        mongoose.set("debug", true);
        console.log("Connected to MongoDB - Dev Database");

        // Get reference to the database
        const db = mongoose.connection.db;
        
        // List existing collections
        const collections = await db.listCollections().toArray();
        console.log("Existing collections:", collections.map(c => c.name));

        // Clear all existing data
        console.log("Clearing existing database collections...");
        await Promise.all([
            User.deleteMany({}),
            consoleLogHistorySchema.deleteMany({})
        ]);
        console.log("Database collections cleared successfully");

        // Create initial users
        const user = await User.create({
            Name: "Gikenyi",
            email: "s@email.com",
            Password: "1234"
        });

        const admin = await User.create({
            Name: "User",
            email: "admin@email.com",
            Password: "admin1234",
            UserType: "admin"
        });

        console.log("Initial users created successfully");
        
        // Log the current state of the database
        const userCount = await User.countDocuments();
        const consoleCount = await consoleLogHistorySchema.countDocuments();
        console.log(`Database status:
        - Database name: ${db.databaseName}
        - Users created: ${userCount}
        - Console records: ${consoleCount}`);

    } catch (error) {
        console.error("Database initialization error:", error);
        console.error("Error details:", error.message);
        process.exit(1); // Exit if database initialization fails
    }
}
// Initialize database before starting the server
await initializeDatabase();
// making console so that it can use live data instead
// Get or create user console if it doesn't exist
// getUserConsole function
async function getUserConsole(userId, userType) {
    try {
        if (userType !== 'admin') {
            console.log(`Attempting to find console for user ID: ${userId}`);
            let userConsole = await consoleLogHistorySchema.findOne({ UserID: userId });

            if (!userConsole) {
                console.log(`No existing console found, creating new one...`);
                userConsole = await consoleLogHistorySchema.create({
                    UserID: userId,
                    Messages: [],
                    active: true
                });
                console.log(`New console created with ID: ${userConsole._id}`);
            } else {
                // Reactivate existing console
                await consoleLogHistorySchema.findOneAndUpdate(
                    { UserID: userId },
                    { $set: { active: true } }
                );
                console.log(`Reactivated console with ID: ${userConsole._id}`);
                console.log(`Messages count: ${userConsole.Messages.length}`);
            }
            return userConsole;
        }
        return null;
    } catch (error) {
        console.error(`Error managing user console: ${error.message}`);
        throw error;
    }
}
// user samples

async function getStatTracker(userId, userType) {
    try {
        console.log(`Attempting to find stat tracker for user ID: ${userId}`);
        let statTracker = await UserStats.findOne({ UserID: userId });

        if (!statTracker) {
            console.log(`No existing stat tracker, creating new one...`);
            statTracker = await UserStats.create({
                UserID: userId,
                timePlayed: 0,
                riddleGuesses: {
                    left: 0,
                    right: 0,
                },
                gameCompletions: 0,
                numberOfDeaths: 0,
                riddleGuesses: {
                    correct: 0,
                    incorrect: 0,
                },
                audioFiles: {
                    inputNotification: 0,
                    hit: 0,
                    death: 0,
                    intro: 0,
                    forestIntro: 0,
                    forestFight: 0,
                    battleMusic: 0,
                    forestObstacle: 0,
                    riddleIntro: 0,
                    notHere: 0,
                    ahRiddle: 0,
                    riddle: 0,
                    openDoor: 0,
                    finale: 0,
                    ending: 0,
                },
                commands: {
                    startGame: 0,
                    pause: 0,
                    play: 0,
                    repeat: 0,
                    endGame: 0,
                    speedUp: 0,
                    slowDown: 0,
                    restart: 0,
                    clear: 0,
                    rewind: 0,
                    help: 0,
                },
                heatmap: {
                    forestObstacle: 0,
                    forestFight: 0,
                    riddle: 0,
                    boss: 0,
                },
            });
            console.log(`New stat tracker created with ID: ${statTracker._id}`);

            return statTracker;
        }
        console.log(`No stats for "${userType}" necessary.`);
        return null;
    } catch (error) {
        console.error(`Error managing user stats: ${error.message}`);
        throw error;
    }
}

// user samples
async function save() {
    try {
        // DO NOT USE IN PROD THIS WILL WIPE ALL USER DATA
        // Removes previous samples for dev purposes.
        await User.deleteMany({});
        await UserStats.deleteMany({});

        const user = await User.create({
            Name: "Gikenyi",
            email: "s@email.com",
            Password: "1234"
        });
        const admin = await User.create({
            Name: "User",
            email: "admin@email.com",
            Password: "admin1234",
            UserType: "admin"
        });
        const smelvin = await User.create({
            Name: "Smelvin Potter",
            email: "spotter@email.com",
            Password: "approaching"
        });


        // Example stats for Gikenyi.
        const gikenyiStatTracker = await UserStats.create({
            UserID: user._id,
            timePlayed: 500,
            pathChoices: {
                left: 2,
                right: 1,
            },
            gameCompletions: 2,
            numberOfDeaths: 1,
            riddleGuesses: {
                correct: 2,
                incorrect: 6,
            },
            audioFiles: {
                inputNotification: 45,
                hit: 34,
                death: 34,
                intro: 25,
                forestIntro: 25,
                forestFight: 23,
                battleMusic: 23,
                forestObstacle: 23,
                riddleIntro: 34,
                notHere: 23,
                ahRiddle: 23,
                riddle: 25,
                openDoor: 22,
                finale: 21,
                ending: 10,
            },
            commands: {
                startGame: 3,
                pause: 1,
                play: 1,
                repeat: 6,
                endGame: 1,
                speedUp: 2,
                slowDown: 1,
                restart: 1,
                clear: 3,
                rewind: 2,
                help: 3,
            },
            heatmap: {
                forestObstacle: 100,
                forestFight: 50,
                riddle: 200,
                boss: 150,
            },
        });

        // Example stats for Smelvin.
        const smelvinStatTracker = await UserStats.create({
            UserID: smelvin._id,
            timePlayed: 11766,
            pathChoices: {
                left: 47,
                right: 81,
            },
            gameCompletions: 128,
            numberOfDeaths: 0,
            riddleGuesses: {
                correct: 128,
                incorrect: 0,
            },
            audioFiles: {
                inputNotification: 425,
                hit: 134,
                death: 134,
                intro: 125,
                forestIntro: 125,
                forestFight: 123,
                battleMusic: 123,
                forestObstacle: 123,
                riddleIntro: 134,
                notHere: 123,
                ahRiddle: 123,
                riddle: 125,
                openDoor: 122,
                finale: 121,
                ending: 128,
            },
            commands: {
                startGame: 128,
                pause: 21,
                play: 21,
                repeat: 16,
                endGame: 0,
                speedUp: 3,
                slowDown: 2,
                restart: 7,
                clear: 11,
                rewind: 5,
                help: 0,
            },
            heatmap: {
                forestObstacle: 2984,
                forestFight: 2529,
                riddle: 3007,
                boss: 3245,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
    }
}
save();

// authenticated function. checks whether you are authenticated or not
function ensureAuthenticated(req, res, next) {
    const whitelistedPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
    if (whitelistedPaths.some((path) => req.path.startsWith(path))) {
        return next(); // Skip authentication for whitelisted paths
    }

    if (req.session && req.session.user) {
        return next(); // Allow if authenticated
    }

    console.log("redirecting ensure authenticated")
    res.redirect('/login'); // Redirect if not authenticated
}

// post route
app.post("/login", express.json(), async (req, res) => {
    try {
        const { username, password } = req.body;
        // console.log("Received login data:", req.body); hashed for security reasons

        const user = await User.findOne({email: username});

        if(!user){
            console.log("does not exist");
            return res.status(401).json({
                success: false,
                message: "invalid credentials"
            });
        }

        // compare the password inserted with the ones in the database if the email is correct
        const isMatch = await user.comparePassword(password);

        if(!isMatch){
            console.log("wrong password");
            return res.status(401).json({
                success: false,
                message: "invalid credentials"
            });
        }
        // Only create/get console for regular users
        if (user.UserType !== 'admin') {
            await getUserConsole(user._id, user.UserType);
        }
        console.log('console loaded');
        // Creates stat tracker
        await getStatTracker(user._id, user.UserType);
        console.log('Stat tracker loaded');

        // assigning sessions to the user while allowing them to login 

        req.session.user = {
            id: user._id,
            email: user.email,
            userType: user.UserType
        };

        const redirectPath = user.UserType === 'admin' 
        ? '/dashboard?initial=true'  // Add the initial parameter for admins
        : '/play';

        // Make sure to await the session save
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({
            success: true,
            message: "Login successful",
            redirect: redirectPath
        });
    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// signup route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const user = new User({ Name: name, email, Password: password });
        await user.save();

        // Create console for new user
        await getUserConsole(user._id, user.UserType);
        console.log('console created');

        // Creates stat tracker for new user
        await getStatTracker(user._id, user.UserType);
        console.log('Stat tracker created');

        // Set up session for new user
        req.session.user = {
            id: user._id,
            email: user.email,
            userType: user.UserType
        };

        await req.session.save();

        res.status(201).json({ success: true, redirect: '/play' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email.' });
        }

        // Generate a reset token
        const token = uuidv4();
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        console.log('Token and expiration saved:', {
            token: user.resetToken,
            expiration: user.resetTokenExpiration,
        });

        // Send reset link via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'group8cflt@gmail.com',
                pass: 'jbjw spzi qevq vpvc',
            },
        });

        const resetLink = `http://localhost:4173/reset-password?token=${token}`;

        const mailOptions = {
            from: 'group8cflt@gmail.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
    `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'A reset link has been sent to your email.' });
    } catch (error) {
        console.error('Error in /forgot-password:', error);
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
});

app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    console.log("Reset Password Request Received");
    console.log("Token:", token);
    console.log("Password:", password);

    try {
        // Find the user with the matching reset token and check if it's still valid
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            console.log("Invalid or expired token");
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        // Log user details for verification
        console.log("User found:", user);

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password and remove the reset token
        await User.updateOne(
            { _id: user._id },
            {
                $set: { Password: hashedPassword },
                $unset: { resetToken: "", resetTokenExpiration: "" },
            }
        );

        console.log("Password updated successfully");
        res.json({ message: "Password has been reset successfully. Redirecting to login...", redirect: "/login" });
    } catch (error) {
        console.error("Error in /reset-password:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

// logout route
app.post('/logout', ensureAuthenticated, async (req, res) => {
    try {
        // Get user ID before destroying session
        const userId = req.session.user.id;
        const userType = req.session.user.userType;

        // Clear the console if user is not admin
        if (userType !== 'admin' && userId) {
            try {
                // Update console status to indicate it's closed
                await consoleLogHistorySchema.findOneAndUpdate(
                    { UserID: userId },
                    {
                        $set: {
                            active: false,
                            lastClosed: new Date()
                        }
                    }
                );
                console.log(`Console closed for user ${userId}`);
            } catch (error) {
                console.error('Error closing console:', error);
            }
        }

        // Clear session data
        if (req.session) {
            await new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'strict'
            });

            res.status(200).json({
                success: true,
                message: 'Logout successful',
                redirect: '/login'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'No active session'
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
});

// Route for getting the console history
// TODO : For some reason going to the /play route will give an error in the server, but all works as intended so
//  that can be a low priority fix
app.get("/get_console_history", ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const consoleHistory = await consoleLogHistorySchema.find({ UserID: userId });

        if (!consoleHistory) {
            return res.status(404).json({ error: 'No console history found' });
        }

        res.status(200).json(consoleHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Route for posting a new console message to the database
app.post("/post_console_history",ensureAuthenticated ,async (req, res) => {
    console.log ("POST /post_console_history called")
    try {
        const userId = req.session.user.id;
        const { MessageID, Message, Speaker } = req.body;

        const updatedDocument = await consoleLogHistorySchema.findOneAndUpdate(
            { UserID: userId },
            { $push: { Messages: { MessageID, Message, Speaker } } }
        );

        if (!updatedDocument) {
            return res.status(404).send('Console not found');
        }

        res.status(200).send("Message posted successfully");
    } catch (error) {
        console.error('Error posting to console history : ', error);
        res.status(500).send('Internal Server Error');
    }
})
//dashboard contains all the admin dashboard needed
app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        // Check if the user is an admin
        if (!req.session.user || req.session.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // If this is the initial dashboard access after login, redirect to user stats
        if (req.query.initial === 'true') {
            return res.redirect('/user-stats');
        }

        // Otherwise render the dashboard normally
        console.log("admin_dashboard");
        const html = await renderReact(req.originalUrl);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
});

//getting user-types which will be crucial for the banner
// Add this new endpoint in your server code
app.get('/user/type', ensureAuthenticated, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        res.json({ userType: req.session.user.userType });
        console.log('user type being called');
    } catch (error) {
        console.error('Error getting user type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get stats
app.get('/user/stats', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const stats = await UserStats.findOne({ UserID: userId });

        if (!stats) {
            return res.status(404).send('Stat tracker not found');
        }

        res.status(200).json({stats});

    } catch (error) {
        console.error('Error getting to stat tracker : ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Post stats
app.post("/user/stats", ensureAuthenticated, async (req, res) => {
    console.log("POST /user/stats called");

    try {
        const userId = req.session.user.id;
        const {
            timePlayed,
            pathChoices,
            gameCompletions,
            numberOfDeaths,
            riddleGuesses,
            audioFiles,
            commands,
            heatmap
        } = req.body;

        // Prepare the update object
        const updateFields = {};

        // Increments stat depending on context
        if (timePlayed) updateFields.timePlayed = timePlayed;

        if (pathChoices) {
            if (pathChoices.left) updateFields["pathChoices.left"] = pathChoices.left;
            if (pathChoices.right) updateFields["pathChoices.right"] = pathChoices.right;
        }

        if (gameCompletions) updateFields.gameCompletions = gameCompletions;

        if (numberOfDeaths) updateFields.numberOfDeaths = numberOfDeaths;

        if (riddleGuesses) {
            if (riddleGuesses.correct) updateFields["riddleGuesses.correct"] = riddleGuesses.correct;
            if (riddleGuesses.incorrect) updateFields["riddleGuesses.incorrect"] = riddleGuesses.incorrect;
        }

        if (audioFiles) {
            if (audioFiles.inputNotification) updateFields["audioFiles.inputNotification"] = audioFiles.inputNotification;
            if (audioFiles.hit) updateFields["audioFiles.hit"] = audioFiles.hit;
            if (audioFiles.death) updateFields["audioFiles.death"] = audioFiles.death;
            if (audioFiles.intro) updateFields["audioFiles.intro"] = audioFiles.intro;
            if (audioFiles.forestIntro) updateFields["audioFiles.forestIntro"] = audioFiles.forestIntro;
            if (audioFiles.forestFight) updateFields["audioFiles.forestFight"] = audioFiles.forestFight;
            if (audioFiles.battleMusic) updateFields["audioFiles.battleMusic"] = audioFiles.battleMusic;
            if (audioFiles.forestObstacle) updateFields["audioFiles.forestObstacle"] = audioFiles.forestObstacle;
            if (audioFiles.riddleIntro) updateFields["audioFiles.riddleIntro"] = audioFiles.riddleIntro;
            if (audioFiles.notHere) updateFields["audioFiles.notHere"] = audioFiles.notHere;
            if (audioFiles.ahRiddle) updateFields["audioFiles.ahRiddle"] = audioFiles.ahRiddle;
            if (audioFiles.riddle) updateFields["audioFiles.riddle"] = audioFiles.riddle;
            if (audioFiles.openDoor) updateFields["audioFiles.openDoor"] = audioFiles.openDoor;
            if (audioFiles.finale) updateFields["audioFiles.finale"] = audioFiles.finale;
            if (audioFiles.ending) updateFields["audioFiles.ending"] = audioFiles.ending;
        }

        if (commands) {
            if (commands.startGame) updateFields["commands.startGame"] = commands.startGame;
            if (commands.pause) updateFields["commands.pause"] = commands.pause;
            if (commands.play) updateFields["commands.play"] = commands.play;
            if (commands.repeat) updateFields["commands.repeat"] = commands.repeat;
            if (commands.endGame) updateFields["commands.endGame"] = commands.endGame;
            if (commands.speedUp) updateFields["commands.speedUp"] = commands.speedUp;
            if (commands.slowDown) updateFields["commands.slowDown"] = commands.slowDown;
            if (commands.restart) updateFields["commands.restart"] = commands.restart;
            if (commands.clear) updateFields["commands.clear"] = commands.clear;
            if (commands.rewind) updateFields["commands.rewind"] = commands.rewind;
            if (commands.help) updateFields["commands.help"] = commands.help;
        }

        if (heatmap) {
            if (heatmap.forestObstacle) updateFields["heatmap.forestObstacle"] = heatmap.forestObstacle;
            if (heatmap.forestFight) updateFields["heatmap.forestFight"] = heatmap.forestFight;
            if (heatmap.riddle) updateFields["heatmap.riddle"] = heatmap.riddle;
            if (heatmap.boss) updateFields["heatmap.boss"] = heatmap.boss;
        }

        // Updates stat field in database
        const updatedDocument = await UserStats.findOneAndUpdate(
            { UserID: userId },
            { $inc: updateFields }
        );

        if (!updatedDocument) {
            return res.status(404).send("User stats not found");
        }

        res.status(200).send("User stats updated successfully");
    } catch (error) {
        console.error("Error updating user stats:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get site-wide stats
app.get('/site/stats', async (req, res) => {
    try {
        // Combines all the fields into the collected site-wide stats
        const stats = await UserStats.aggregate([
            {
                $group: {
                    _id: null, // Groups all users together
                    totalTimePlayed: { $sum: "$timePlayed" },
                    totalPathChoicesLeft: { $sum: "$pathChoices.left" },
                    totalPathChoicesRight: { $sum: "$pathChoices.right" },
                    totalGameCompletions: { $sum: "$gameCompletions" },
                    totalNumberOfDeaths: { $sum: "$numberOfDeaths" },
                    totalRiddleGuessesCorrect: { $sum: "$riddleGuesses.correct" },
                    totalRiddleGuessesIncorrect: { $sum: "$riddleGuesses.incorrect" },
                    totalInputNotification: { $sum: "$audioFiles.inputNotification" },
                    totalHit: { $sum: "$audioFiles.hit" },
                    totalDeath: { $sum: "$audioFiles.death" },
                    totalIntro: { $sum: "$audioFiles.intro" },
                    totalForestIntro: { $sum: "$audioFiles.forestIntro" },
                    totalForestFight: { $sum: "$audioFiles.forestFight" },
                    totalBattleMusic: { $sum: "$audioFiles.battleMusic" },
                    totalForestObstacle: { $sum: "$audioFiles.forestObstacle" },
                    totalRiddleIntro: { $sum: "$audioFiles.riddleIntro" },
                    totalNotHere: { $sum: "$audioFiles.notHere" },
                    totalAhRiddle: { $sum: "$audioFiles.ahRiddle" },
                    totalRiddle: { $sum: "$audioFiles.riddle" },
                    totalOpenDoor: { $sum: "$audioFiles.openDoor" },
                    totalFinale: { $sum: "$audioFiles.finale" },
                    totalEnding: { $sum: "$audioFiles.ending" },
                    totalStartGame: { $sum: "$commands.startGame" },
                    totalPause: { $sum: "$commands.pause" },
                    totalPlay: { $sum: "$commands.play" },
                    totalRepeat: { $sum: "$commands.repeat" },
                    totalEndGame: { $sum: "$commands.endGame" },
                    totalSpeedUp: { $sum: "$commands.speedUp" },
                    totalSlowDown: { $sum: "$commands.slowDown" },
                    totalRestart: { $sum: "$commands.restart" },
                    totalClear: { $sum: "$commands.clear" },
                    totalRewind: { $sum: "$commands.rewind" },
                    totalHelp: { $sum: "$commands.help" },
                    totalHeatmapForestObstacle: { $sum: "$heatmap.forestObstacle" },
                    totalHeatmapForestFight: { $sum: "$heatmap.forestFight" },
                    totalHeatmapRiddle: { $sum: "$heatmap.riddle" },
                    totalHeatmapBoss: { $sum: "$heatmap.boss" }
                }
            },
            {
                // Calculates the schema's virtual fields
                $addFields: {
                    totalAudioPlayed: {
                        $add: [
                            "$totalInputNotification",
                            "$totalHit",
                            "$totalDeath",
                            "$totalIntro",
                            "$totalForestIntro",
                            "$totalForestFight",
                            "$totalBattleMusic",
                            "$totalForestObstacle",
                            "$totalRiddleIntro",
                            "$totalNotHere",
                            "$totalAhRiddle",
                            "$totalRiddle",
                            "$totalOpenDoor",
                            "$totalFinale",
                            "$totalEnding"
                        ]
                    },
                    totalCommandsUsed: {
                        $add: [
                            "$totalStartGame",
                            "$totalPause",
                            "$totalPlay",
                            "$totalRepeat",
                            "$totalEndGame",
                            "$totalSpeedUp",
                            "$totalSlowDown",
                            "$totalRestart",
                            "$totalClear",
                            "$totalRewind",
                            "$totalHelp"
                        ]
                    },
                    totalRiddleGuesses: {
                        $add: [
                            "$totalRiddleGuessesCorrect",
                            "$totalRiddleGuessesIncorrect"
                        ]
                    },
                    totalPathChoices: {
                        $add: [
                            "$totalPathChoicesLeft",
                            "$totalPathChoicesRight"
                        ]
                    }
                }
            }
        ]);

        // Validates that there are stats in the db
        if (!stats || stats.length === 0) {
            return res.status(404).send('No stats found');
        }else{
            // Finds the users with the highest timePlayed and gameCompletions
            const mostPlayed = await UserStats.findOne().sort({ timePlayed: -1 }).limit(1);
            const mostCompletions = await UserStats.findOne().sort({ gameCompletions: -1 }).limit(1);

            if (!mostPlayed) {
                return res.status(404).send('Most played value not found');
            }
            if (!mostCompletions) {
                return res.status(404).send('Most completions value not found');
            }

            // Retrieve the names of the top players
            const userMostPlayed = await User.findOne({ _id: mostPlayed.UserID });
            const userMostCompletions = await User.findOne({ _id: mostCompletions.UserID });

            // Calculated number of users
            const totalUsers = await User.countDocuments();

            // Gathers the site-wide, mostPlayed and mostCompletions stats
            const response = {
                stats: stats[0],
                mostPlayed: {
                    timePlayed: mostPlayed.timePlayed,
                    name: userMostPlayed.Name
                },
                mostCompletions: {
                    gameCompletions: mostCompletions.gameCompletions,
                    name: userMostCompletions.Name
                },
                totalUsers: totalUsers
            };

            res.status(200).json(response);
        }

    } catch (error) {
        console.error('Error fetching site-wide stats: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route for deleting all console history
app.post("/post_clear_console", ensureAuthenticated,async (req, res) => {
    console.log("POST /post_clear_console called")
    try {
        // using the user id instead
        const userId = req.session.user.id;

        const updatedDocument = await consoleLogHistorySchema.findOneAndUpdate(
            { UserID: userId },
            { $set: { Messages: [] } }
        );

        if (!updatedDocument) {
            return res.status(404).send('Console not found');
        }

        res.status(200).send("Console cleared successfully");
    } catch (error) {
        console.error('Error posting to clear console history : ', error);
        res.status(500).send('Internal Server Error');
    }

})

// This will render all pages React code. The routing specific to the page is in the App.jsx file.
const routes = ["/play", "/my-stats", "/login", "/user-stats", "/404", "/settings", "/dashboard"];
app.get(routes , ensureAuthenticated, async (req, res, next) => {
    console.log(`Generic GET called with the url :  ${req.originalUrl}`)
    try{
            const html = await renderReact(req.originalUrl)
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error(`Error on generic React GET : ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
})

async function renderReact(url) {
    let template = await vite.transformIndexHtml(url, fs.readFileSync('index.html', 'utf-8'));
    // Render React on the server side
    const {render} = await vite.ssrLoadModule('/src/entry-server.jsx');
    // Put the rendered React into the index file, then React is rendered on the client side when it
    template = template.replace(`<!--outlet-->`, `${render(url)}`);
    // Add the dev client side rendering script in
    return template.replace("<!--entry-client-script-->", `<script type='module' src='./src/entry-client.jsx'></script>`)
}

app.get('/reset-password', async (req, res) => {
    try {
        console.log("Reset Password GET Request Received");

        // Extract token from query params
        let token = req.query.token;

        if (!token) {
            console.error("No token provided in the request");
            return res.status(400).send('Invalid request. No token provided.');
        }

        const html = await renderReact(req.originalUrl)
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error('Error rendering /reset-password:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.use(vite.middlewares);

// Add this after all your routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});


// app.use((req, res, next) => {
//     if (!req.path.startsWith('/api')) {
//         res.sendFile(path.resolve(__dirname, 'dist', 'index.html')); // Adjust path to your React build directory
//     } else {
//         next();
//     }
// });

// TODO : Figure out what is double calling this (likely same culprit as the get_console_history bug on /play)
// If nothing catches the request, the user will be sent to the login screen or the 404 page.
app.use((req, res, next) => {
    res.redirect("/404")
})
app.listen(4173, () => {
    console.log('http://localhost:4173.');
});

