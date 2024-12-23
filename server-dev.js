import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import { createServer } from 'vite';
import testMongoSchema from "./models/mongoosetest.js";
import ReactDOMServer from 'react-dom/server';
import React from 'react';
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

// MongoDB Linking Test Code
const dbURI = "mongodb://localhost:27017/testDB";

// Updated MongoDB connection using async/await
try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB");
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}

// Test user creation
async function save() {
    try {
        const user = await User.create({
            FirstName: "Clevis",
            LastName: "Gikenyi",
            email: "s@email.com",
            Password: "1234"
        });
        console.log(user);
    } catch (error) {
        console.error("Error creating user:", error);
    }
}
save();
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

    } catch (error){
        console.error('Error rendering Logging in:', error);
        res.status(500).send('Internal Server Error');
    }
})
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
