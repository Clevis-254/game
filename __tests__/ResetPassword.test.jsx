import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../src/Pages/resetPassword.jsx';
import expect from "expect";

describe('Reset Password Component', () => {
    it('renders reset password form', () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        // Check if password input fields are present
        expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();

        // Check if reset button is present
        expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    });

    it('shows a success message if password reset is successful', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Password reset successfully' }),
            })
        );

        // Fill in the form
        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword123' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

        // Check for success message
        const successMessage = await screen.findByText(/Password reset successfully/i);
        expect(successMessage).toBeInTheDocument();
    });

    it('shows an error message if passwords do not match', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        // Fill in the form with mismatched passwords
        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword123' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'differentpassword' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

        // Check for error message
        const errorMessage = await screen.findByText(/Passwords do not match/i);
        expect(errorMessage).toBeInTheDocument();
    });
});