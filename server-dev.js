import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose'
import { createServer } from 'vite';
import consoleLogHistorySchema from "./models/consoleLogHistory.js";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

const vite = await createServer({
    server: {
        middlewareMode: true,
    },
    appType: 'custom',
});

/* TODO : Eventually run any mongoDB linking on an actual external server we connect to instead of just running localhost
     although that might be out the scope of this project */

const dbURI = "mongodb://localhost:27017/projectDatabase"

mongoose.connect(dbURI);

mongoose.set("debug", true)

app.get("/get_console_history", async (req, res) => {
    console.log("GET /get_console_history called")
    try {
        // TODO : integrate with the login system to get the correct userID
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

app.use(vite.middlewares);

// This will render all pages React code. The routing specific to the page is in the App.jsx file.
app.get("*", async (req, res) => {
    console.log(`Generic GET called with the url :  ${req.originalUrl}`)
    try{
        // TODO : AXE THIS BELOW LINE AND IN render function use REQ.ORIGINALURL
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
})

app.listen(4173, () => {
    console.log('http://localhost:4173.');
});
