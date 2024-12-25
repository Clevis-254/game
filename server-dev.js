import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import { createServer } from 'vite';
import testMongoSchema from "./models/mongoosetest.js";
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import session from 'express-session';
//importing the user schema 
import User from './data.js';

//importing express into the server
const app = express();

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
            FirstName: "Clevis",
            LastName: "Gikenyi",
            email: "s@email.com",
            Password: "1234"
        });
        console.log(user);
        const admin = await User.create({
            FirstName: "Admin",
            LastName: "User",
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
    if (req.isAuthenticated()) {
        // If the user is authenticated, proceed to the next function (e.g., route handler)
        return next();
    } else {
        // If not authenticated, redirect to the login page
        return res.redirect('/login');  // Redirects to the login page
    }
}


// basic functions
app.get("/login", async (req, res) => {
    try{
        console.log("logging in")

        // Dynamically load the React component using Vite
        const module = await vite.ssrLoadModule('src/login.jsx');
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
        console.error('Error rendering Logging in:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.post("/login", async(req,res) => {
    try{

        req.session.isAuthenticated = true;
    } catch (error){
        console.error('Error rendering Logging in:', error);
        res.status(500).send('Internal Server Error');
    }
})

// logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');  // Clear the session cookie
        res.redirect('/login');
    });
});

// Play page route.
app.get("/play", async (req, res) => {
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
app.get("/my-stats", async (req, res) => {
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
app.get("/user-stats", async (req, res) => {
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

app.listen(4173, () => {
    console.log('http://localhost:4173.');
});
