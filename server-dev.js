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
// TODO : TEMP CODE AS OUR DB IS CURRENTLY ENTIRELY LOCAL TO MAKE SURE THAT A SINGLE DEFAULT USERID IS ADDED TO THE MESSAGE SYSTEM
async function firstConsoleUser(){
    try {
        const exists = await consoleLogHistorySchema.exists({ UserID: 0 });
        if(!exists){
            const newFirstUser = await consoleLogHistorySchema.create({UserID: 0, Messages: []})
        }
    } catch (error) {
        console.log(`Error creating first user : ${error.message}`)
    }
}
firstConsoleUser()

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
        // User is authenticated
        return next();
    }
    // User is not authenticated
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

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Create a new user
        const user = new User({ Name: name, email, Password: password });
        await user.save();

        res.status(201).json({ success: true, redirect: '/login' });
    } catch (error) {
        // Catch and handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        // Handle other errors
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




// logout route
app.post('/logout', ensureAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get("/get_console_history", async (req, res) => {
    console.log("GET /get_console_history called")
    try {
        // TODO : integrate with the login system to get the correct userID
        // TODO : update it to be findOne, then update Console.jsx code too
        const consoleHistory = await consoleLogHistorySchema.find({"UserID" : 0})
        res.json(consoleHistory)

    } catch (error) {
        console.error('Error getting console history:', error);
        res.status(500).send('Internal Server Error');
    }
})

// Route for posting a new console message to the database
app.post("/post_console_history", async (req, res) => {
    console.log ("POST /post_console_history called")
    try {
        const { MessageID, Message, Speaker } = req.body

        // TODO : integrate with the login system to get the correct userID
        const updatedDocument = await consoleLogHistorySchema.findOneAndUpdate(
            {"UserID" : 0},
            { $push : { Messages : { MessageID, Message, Speaker} } }
        )
        if (!updatedDocument) {
            return res.status(404).send('Document not found');
        }
        return res.status(200).send("Request to post new message to DB successful")
    } catch (error) {
        console.error('Error posting to console history : ', error);
        res.status(500).send('Internal Server Error');
    }
})


// POST route for deleting all console history
app.post("/post_clear_console", async (req, res) => {
    console.log("POST /post_clear_console called")
    try {
        // TODO : integrate with the login system to get the correct userID
        const updatedDocument = await consoleLogHistorySchema.findOneAndUpdate(
            {"UserID" : 0},
            { $set : { Messages : [] } }
        )
        if (!updatedDocument) {
            return res.status(404).send('Document not found');
        }
        return res.status(200).send("Request to clear messages sent to DB successfully")
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

