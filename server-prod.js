import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import User from "./models/UserSchema.js";
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import vite from "vite";
import {data} from "express-session/session/cookie.js";
import bcrypt from "bcrypt";

const app = express();

app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist/client'), { index: false }));

app.use('*', async (_, res) => {
    try {
        const template = fs.readFileSync('./dist/client/index.html', 'utf-8');
        const { render } = await import('./dist/server/entry-server.js');


        // const { getServerData } = await import('./dist/function/function.js');
        // const data = await getServerData();
        // const script = `<script>window.__data__=${JSON.stringify(data)}</script>`;

        // const html = template.replace(`<!--outlet-->`, `${render(data)} ${script}`);
        const html = template.replace(`<!--outlet-->`, `${render(data)}`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
        res.status(500).end(error);
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

        // Encrypt the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.Password = hashedPassword;
        user.resetToken = undefined; // Clear the reset token
        user.resetTokenExpiration = undefined; // Clear the expiration time
        await user.save();

        console.log("Password updated successfully");
        res.json({ message: "Password has been reset successfully. Redirecting to login...", redirect: "/login" });
    } catch (error) {
        console.error("Error in /reset-password:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});


app.get('/reset-password', async (req, res) => {
    try {
        console.log("Reset Password GET Request Received");

        // Extract token from query params
        const token = req.query.token;
        if (!token) {
            console.error("No token provided in the request");
            return res.status(400).send('Invalid request. No token provided.');
        }
        console.log("Token:", token);

        // Render the React app
        const template = fs.readFileSync('index.html', 'utf-8');
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        const appHtml = render(req.originalUrl); // No changes to appHtml generation

        const html = template.replace('<!--outlet-->', appHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
        console.error('Error rendering /reset-password:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html')); // Adjust path to your React build directory
    } else {
        next();
    }
});

app.listen(5173, () => {
    console.log('http://localhost:5173.');
});