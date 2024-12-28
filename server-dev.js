import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import { createServer } from 'vite';
import testMongoSchema from "./models/mongoosetest.js";
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import session from 'express-session';
import bcrypt, { compare } from 'bcrypt';
//importing the user schema 
import User from './data.js';


//importing express into the server
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
// creating authentication session
app.use(session({
    secret: 'c5afbf2a6d07b53a8ac4f3ac154d2138bf4a89a39037d8caf47db0ed6d8469e08b94644a1c9d47852fe7ac9939bbaec7c8c7a23113c8a824cd27b6e0912b7804', // secret key
    resave: false,  // Do not save the session if it hasn't changed
    saveUninitialized: false,  // Do not create a session until something is stored
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,  // 1 day cookie lifetime
        secure: true  // Set to true if you're using HTTPS
    }
}));
// MongoDB Linking Test Code
const dbURI = "mongodb://localhost:27017/testDB";

// Updated MongoDB connection using async/await
try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB");
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}

// user samples 
async function save() {
    try {
        const user = await User.create({
            Name: "Gikenyi",
            email: "s@email.com",
            Password: "1234"
        });
        console.log(user);
        const admin = await User.create({
            Name: "User",
            email: "admin@email.com",
            Password: "admin1234",
            UserType: "admin"
        });
        console.log(admin)
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
        const { render } = await vite.ssrLoadModule('src/entry-server-login.jsx');
        
        // Render the component
        const appHtml = render();
        
        // Get and transform the template
        let template = await vite.transformIndexHtml(req.originalUrl, fs.readFileSync('index.html', 'utf-8'));
        
        // Insert the rendered app and the client script tag
        const html = template
            .replace('<!--outlet-->', appHtml)
            .replace(
                '</body>',
                `<script type="module" src="/src/entry-client-login.jsx"></script></body>`
            );

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error('Error rendering Login:', error);
        res.status(500).send('Internal Server Error');
    }
})

// post route 
// Add this to your Express server file
app.post("/login", express.json(), async (req, res) => {
    try {
        const { username , password } = req.body
        // checking if the data shipped to the server
        console.log("Received login data:", req.body);
        // checking if the user exists in the database
        const user = await User.findOne({email: username});
// if the user does not exist, it should display the message that the cridentials are invalid
        if(!user){
            console.log("does not exist");
            return res.status(401).json({
                success: false,
                message: "invalid credentials"
            });
        }
        
        // compare the password inserted with the ones in the database if the email is correct
        const isMatch = await compare(password, user.password);

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
        res.json({ 
            success: true, 
            message: "Login successful",
            redirect: '/play' // Frontend will use this to redirect
        });
    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
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

// Play page route.
app.get("/play", ensureAuthenticated,async (req, res) => {
    try{
        console.log("Play")

        // Dynamically load the React component using Vite
        const module = await vite.ssrLoadModule('src/app.jsx');
        const Play = module.default;

        // Render the React component to a string
        const html = ReactDOMServer.renderToString(React.createElement(Play));

        // Get the template (index.html)
        const template = await vite.transformIndexHtml(req.originalUrl, fs.readFileSync('index.html', 'utf-8'));

        // Fetch any necessary server data
        const { getServerData } = await vite.ssrLoadModule('/src/function.js');
        const data = await getServerData();

        // Inject the script with server-side data
        const script = `<script>window.__data__=${JSON.stringify(data)}</script>`;

        // Combine the rendered HTML, the data, and the template
        const fullHtml = template.replace(`<!--outlet-->`, `${html} ${script}`);

        // Send the final HTML to the client
        res.status(200).set({ 'Content-Type': 'text/html' }).end(fullHtml);

    } catch (error) {
        console.error('Error rendering Play:', error);
        res.status(500).send('Internal Server Error');
    }
})

// My Stats page route.
app.get("/my-stats", ensureAuthenticated,async (req, res) => {
    try{
        console.log("My Stats")

        // Dynamically load the React component using Vite
        const module = await vite.ssrLoadModule('src/MyStats.jsx');
        const MyStats = module.default;

        // Render the React component to a string
        const html = ReactDOMServer.renderToString(React.createElement(MyStats));

        // Get the template (index.html)
        const template = await vite.transformIndexHtml(req.originalUrl, fs.readFileSync('index.html', 'utf-8'));

        // Fetch any necessary server data
        const { getServerData } = await vite.ssrLoadModule('/src/function.js');
        const data = await getServerData();

        // Inject the script with server-side data
        const script = `<script>window.__data__=${JSON.stringify(data)}</script>`;

        // Combine the rendered HTML, the data, and the template
        const fullHtml = template.replace(`<!--outlet-->`, `${html} ${script}`);

        // Send the final HTML to the client
        res.status(200).set({ 'Content-Type': 'text/html' }).end(fullHtml);

    } catch (error) {
        console.error('Error rendering MyStats:', error);
        res.status(500).send('Internal Server Error');
    }
})

// User Stats page route.
app.get("/user-stats", ensureAuthenticated,async (req, res) => {
    try {
        console.log("User Stats");

        // Dynamically load the React component using Vite
        const module = await vite.ssrLoadModule('src/UserStats.jsx');
        const UserStats = module.default;

        // Render the React component to a string
        const html = ReactDOMServer.renderToString(React.createElement(UserStats));

        // Get the template (index.html)
        const template = await vite.transformIndexHtml(req.originalUrl, fs.readFileSync('index.html', 'utf-8'));

        // Fetch any necessary server data
        const { getServerData } = await vite.ssrLoadModule('/src/function.js');
        const data = await getServerData();

        // Inject the script with server-side data
        const script = `<script>window.__data__=${JSON.stringify(data)}</script>`;

        // Combine the rendered HTML, the data, and the template
        const fullHtml = template.replace(`<!--outlet-->`, `${html} ${script}`);

        // Send the final HTML to the client
        res.status(200).set({ 'Content-Type': 'text/html' }).end(fullHtml);

    } catch (error) {
        console.error('Error rendering UserStats:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.use(vite.middlewares);

app.use('*', async (req, res) => {
    const url = req.originalUrl;

    try {
        const template = await vite.transformIndexHtml(url, fs.readFileSync('index.html', 'utf-8'));
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');

        const { getServerData } = await vite.ssrLoadModule('/src/function.js');
        const data = await getServerData();
        const script = `<script>window.__data__=${JSON.stringify(data)}</script>`;

        const html = template.replace(`<!--outlet-->`, `${render(data)} ${script}`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
        res.status(500).end(error);
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

app.listen(4173, () => {
    console.log('http://localhost:4173.');
});

