import React from 'react';

export function Banner() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container d-flex justify-content-between">
        <a className="navbar-brand" href="/">
          TOXIC RŌNIN
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarsExample07"
          aria-controls="navbarsExample07"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-between" id="navbarsExample07">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/play">
                Play
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/my-stats">
                My Stats
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/user-stats">
                User Stats
              </a>
            </li>
          </ul>
          <button className="btn btn-link nav-link" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                stroke="White"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="1.5"
                d="M17.44 14.62L20 12.06 17.44 9.5M9.76 12.06h10.17M11.76 20c-4.42 0-8-3-8-8s3.58-8 8-8"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Banner;