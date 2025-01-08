import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import consoleLogHistorySchema from "./models/consoleLogHistory.js";
import bodyParser from "body-parser";
import session from 'express-session';
import bcrypt, { compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
//importing the user schema
import User from './models/UserSchema.js';
import error from "express/lib/view.js";
import path from "path";
import {redirect} from "react-router-dom";


//importing express into the server
const app = express();

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

//  middleware configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// creating authentication session
// Update your session configuration
app.use(session({
    secret: 'c5afbf2a6d07b53a8ac4f3ac154d2138bf4a89a39037d8caf47db0ed6d8469e08b94644a1c9d47852fe7ac9939bbaec7c8c7a23113c8a824cd27b6e0912b7804',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,  // 1 day
        secure: false,  // Changed to false for development
        httpOnly: true
    }
}));
// MongoDB Linking Test Code
// const dbURI = "mongodb+srv://demo_user:321@cluster0.dayzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const dbURI = "mongodb://localhost:27017/projectDatabase"
const dbURI = "mongodb+srv://Admin_1:lLrnAwIbvkI7Hgj9@clustergroup8.o6myn.mongodb.net/Prod"; // production database


// Updated MongoDB connection using async/await
try {
    await mongoose.connect(dbURI);
    mongoose.set("debug", true)
    console.log("Connected to MongoDB");
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}
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
async function save() {
    try {
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
        console.log("Received login data:", req.body);

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

        // assigning sessions to the user while allowing them to login
        req.session.user = {
            id: user._id,
            email: user.email,
            userType: user.UserType
        };

        const redirectPath = user.UserType === 'admin' ? '/dashboard' : '/play';

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
const routes = ["/play", "/my-stats", "/login", "/user-stats", "/404", "/settings"]
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

const staticDir = path.join(process.cwd(), 'dist/client');
console.log('Static Directory:', staticDir);
app.use(express.static(staticDir));
async function renderReact(url) {
    // Import entry-clients hashed name using the name from manifest.json
    const manifest = JSON.parse(fs.readFileSync(path.join("dist/client/.vite", 'manifest.json'), 'utf-8'));
    const entryClient = manifest['src/entry-client.jsx'].file; // Get the hashed file

    let template = fs.readFileSync('index.html', 'utf-8');

    // Import the CSS file from manifest.json (vite build optimises it into 1 file)
    const entry = manifest['src/entry-client.jsx'];
    if (entry?.css?.[0]) {
        const cssFile = entry.css[0];
        const cssLink = `<link rel="stylesheet" href="${cssFile}">`;
        template = template.replace('</head>', `${cssLink}\n</head>`);
    }
    // Render React on the server side
    const {render} = await import('./dist/server/entry-server.js')
    // Put the rendered React into the index file, then React is rendered on the client side when it
    const html = template.replace(`<!--outlet-->`, `${render(url)}`);
    // Add the prod client side rendering script
    return html.replace("<!--entry-client-script-->", `<script type='module' src='${entryClient}'></script>`)
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

