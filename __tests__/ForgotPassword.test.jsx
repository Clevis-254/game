import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../src/Pages/forgotPassword.jsx';
import expect from "expect";

describe('Forgot Password Component', () => {
    it('renders forgot password form', () => {
        render(
            <BrowserRouter>
                <ForgotPassword />
            </BrowserRouter>
        );

        // Check if email input is present
        expect(screen.getByLabelText(/Enter your email/i)).toBeInTheDocument();

        // Check if reset button is present
        expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    });

    it('shows a success message when reset link is sent', async () => {
        render(
            <BrowserRouter>
                <ForgotPassword />
            </BrowserRouter>
        );

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Reset link sent to your email.' }),
            })
        );

        // Fill in the email field
        fireEvent.change(screen.getByLabelText(/Enter your email/i), { target: { value: 'test@example.com' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

        // Check for success message
        const successMessage = await screen.findByText(/Reset link sent to your email/i);
        expect(successMessage).toBeInTheDocument();
    });

    it('shows an error message if email does not exist', async () => {
        render(
            <BrowserRouter>
                <ForgotPassword />
            </BrowserRouter>
        );

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'No user found with this email.' }),
            })
        );

        // Fill in the email field
        fireEvent.change(screen.getByLabelText(/Enter your email/i), { target: { value: 'nonexistent@example.com' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

        // Check for error message
        const errorMessage = await screen.findByText(/No user found with this email/i);
        expect(errorMessage).toBeInTheDocument();
    });
});