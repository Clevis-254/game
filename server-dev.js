import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import { createServer } from 'vite';
import consoleLogHistorySchema from "./models/consoleLogHistory.js";
import bodyParser from "body-parser";
import session from 'express-session';
import bcrypt, { compare } from 'bcrypt';
//importing the user schema 
import User from './models/UserSchema.js';
import error from "express/lib/view.js";


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
const vite = await createServer({
    server: {
        middlewareMode: true,
    },
    appType: 'custom',
});
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
const dbURI = "mongodb://localhost:27017/projectDatabase"

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
async function getUserConsole(userId, userType) {
    try {
        if (userType !== 'admin') {
            let userConsole = await consoleLogHistorySchema.findOne({ 
                UserID: userId 
            });
            
            if (!userConsole) {
                userConsole = await consoleLogHistorySchema.create({
                    UserID: userId,
                    Messages: []
                });
                console.log(`Created new console for user ${userId}`);
            } else {
                console.log(`Loaded existing console for user ${userId}`);
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
    if (req.session && req.session.user) {
        return next();
    }
    
    // Check if request wants JSON response
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Otherwise redirect to login page
    res.redirect('/login');
}
// basic functions
app.get("/login", async (req, res) => {
    try {
        console.log("logging in")

        // Load the server entry point for login
        const { render } = await vite.ssrLoadModule('src/entry-server.jsx');
        
        // Render the component
        const appHtml = render();
        
        // Get and transform the template
        let template = await vite.transformIndexHtml(req.originalUrl, fs.readFileSync('index.html', 'utf-8'));
        
        // Insert the rendered app and the client script tag
        const html = template.replace(`<!--outlet-->`, `${render(req.originalUrl)}`);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error('Error rendering Login:', error);
        res.status(500).send('Internal Server Error');
    }
})

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

// logout route
app.post('/logout', ensureAuthenticated, async (req, res) => {
    try {
        // Clear any authenticated user data
        if (req.session) {
            // Destroy the session
            await new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            // Clear the session cookie
            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure:false,//to be used in prod process.env.NODE_ENV === 'production',
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


// Play page route.
app.get("/play", ensureAuthenticated,async (req, res) => {
    console.log("GET /play called")
    try{
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, fs.readFileSync('index.html', 'utf-8'));
        // Render React on the server side
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        // Put the rendered React into the index file, then React is rendered on the client side when it
        const html = template.replace(`<!--outlet-->`, `${render(url)}`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error(`Error on GET /play : ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
})

// My Stats page route.
app.get("/my-stats", ensureAuthenticated,async (req, res) => {
    console.log("GET /my-stats called")
    try{
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, fs.readFileSync('index.html', 'utf-8'));
        // Render React on the server side
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        // Put the rendered React into the index file, then React is rendered on the client side when it
        const html = template.replace(`<!--outlet-->`, `${render(url)}`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error(`Error on GET /my-stats : ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
})

// User Stats page route.
app.get("/user-stats", ensureAuthenticated,async (req, res) => {
    console.log("GET /user-stats called");
    try{
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, fs.readFileSync('index.html', 'utf-8'));
        // Render React on the server side
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        // Put the rendered React into the index file, then React is rendered on the client side when it
        const html = template.replace(`<!--outlet-->`, `${render(url)}`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error(`Error on GET /user-stats : ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

app.use(vite.middlewares);

app.use('*', async (req, res) => {
    res.redirect("/my-stats")
})

// Add this after all your routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(4173, () => {
    console.log('http://localhost:4173.');
});

