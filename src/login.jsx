import React from 'react';
import './Login.css';
import { useForm } from 'react-hook-form';

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
const onSubmit = async (data) => {
  try {
      const response = await fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
          window.location.href = result.redirect;
      } else {
        setErrorMessage(result.message);
          console.error(result.message);
      }
  } catch (error) {
      console.error('Error:', error);
  }
};

  // This prevents the default form submission
  const formSubmit = handleSubmit((data, e) => {
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
              <form onSubmit={formSubmit} noValidate>
                <div className="form-group mb-3">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Enter username"
                    {...register('username', { required: 'Username is required' })}
                  />
                  {errors.username && <span className="text-danger">{errors.username.message}</span>}
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && <span className="text-danger">{errors.password.message}</span>}
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

