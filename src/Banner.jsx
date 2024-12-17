import React from 'react';

export function Banner(){
    return(
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
              <div className="container">
                <a className="navbar-brand" href="#">
                  [Game Name Here]
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
                    <li className="nav-item active">
                      <a className="nav-link" href="/play">
                        Play <span className="sr-only"></span>
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
                </div>
              </div>
            </nav>
          );
}

export default Banner;