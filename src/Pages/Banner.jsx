import React from 'react';
import { Link } from 'react-router-dom';

export function Banner(){
    return(
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
              <div className="container">
                <a className="navbar-brand" href="#">
                  TOXIC RŌNIN
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-toggle="collapse"
                  data-target="#navbarsExample07"
                  aria-controls="navbarsExample07"
                  aria-expanded="true"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="navbar-collapse collapse show" id="navbarsExample07">
                  <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                    <Link className="nav-link" to="/play">Play</Link>
                    </li>
                    <li className="nav-item">
                    <Link className="nav-link" to="/my-stats">My Stats</Link>
                    </li>
                    <li className="nav-item">
                    <Link className="nav-link" to="/user-stats">User Stats</Link>
                    </li>
                    <li className="nav-item">
                    <Link className="nav-link" to="/settings">Settings</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          );
}

export default Banner;