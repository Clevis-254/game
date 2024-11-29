import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import { createServer } from 'vite';
import testMongoSchema from "./models/mongoosetest.js";

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

mongoose.connect(dbURI);

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