import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import { createServer } from 'vite';
import testMongoSchema from "./models/mongoosetest.js";
import ReactDOMServer from 'react-dom/server';
import React from 'react';

const app = express();

const vite = await createServer({
    server: {
        middlewareMode: true,
    },
    appType: 'custom',
});

// MongoDB Linking Test Code (To be removed / replaced at some point)

/* TODO : Eventually run any mongoDB linking on an actual external server we connect to instead of just running localhost
     although that might be out the scope of this project */

const dbURI = "mongodb://localhost:27017/testDB"

//mongoose.connect(dbURI);

// testFun();
// async function testFun(){
//     try {
//         //const testInsert = await testMongoSchema.create({testName : "exampleName"});
//         //console.log ("firstlog : " + testInsert);
//         const testVar = await testMongoSchema.find({testName : "exampleName"})
//         console.log("testvarprint " + testVar);
//     } catch (e) {
//         console.log(e.message);
//     }
// }

/// End of example Mongoose code

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
