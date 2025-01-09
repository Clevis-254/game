import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../src/Pages/Login/login.jsx'; // Ensure this path is correct
import '@testing-library/jest-dom'; // Import jest-dom for extended matchers

describe('Login Component', () => {
    it('renders login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Check if form inputs are present
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

        // Check if login button is present
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('shows an error message if login fails', async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ success: false, message: 'Invalid credentials' }),
            })
        );

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        // Check for error message
        const errorMessage = await screen.findByText(/Invalid credentials/i);
        expect(errorMessage).toBeInTheDocument();

        // Clean up mock
        global.fetch.mockClear();
    });
});
