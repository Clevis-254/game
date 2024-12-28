import React, { useState } from 'react';
import './Login.css';
import { useForm } from 'react-hook-form';

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginError, setLoginError] = useState('');

  const onSubmit = async (data, e) => {
    e.preventDefault(); // Prevent form submission
    try {
      setLoginError(''); // Clear any previous errors
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include' // Important for cookies/session
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Login successful, redirecting to:', result.redirect);
        window.location.href = result.redirect;
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError('An error occurred while logging in. Please try again.');
      console.error('Error:', error);
    }
};
// Update your formSubmit handler
const formSubmit = handleSubmit((data, e) => {
    e.preventDefault(); // Prevent form submission
    onSubmit(data, e);
});

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center mb-3">Login</h3>
              <div className="text-center mb-4">
                <img src="/assets/Logo_2.png" alt="Logo" className="img-fluid logo" />
              </div>
              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}
              <form onSubmit={formSubmit} noValidate>
                <div className="form-group mb-3">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    placeholder="Enter username"
                    {...register('username', { required: 'Username is required' })}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">
                      {errors.username.message}
                    </div>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    placeholder="Password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                >
                  Login
                </button>
              </form>
              <div className="text-center mt-3">
                <a href="/signup" className="signup-link">Create an account or sign up now!</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default Login;