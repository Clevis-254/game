import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../src/Signup/signup.jsx';
import expect from "expect";

describe('Signup Component', () => {
    it('renders signup form', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        // Check if form inputs are present
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

        // Check if signup button is present
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    });

    it('shows an error message if signup fails', async () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ success: false, message: 'Email already exists' }),
            })
        );

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        // Check for error message
        const errorMessage = await screen.findByText(/Email already exists/i);
        expect(errorMessage).toBeInTheDocument();
    });
});