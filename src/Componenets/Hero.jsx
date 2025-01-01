import React from 'react';
import { Play, Scroll } from 'lucide-react';
import { Console } from "../Console/Console.jsx";

export function Hero() {
  return (
    <div className="vh-100 position-relative d-flex align-items-center justify-content-center" 
         style={{
           backgroundImage: 'url("/assets/LandingPageBackground.jpg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
            
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-75"></div>
      <div className="container position-relative text-center text-white">
        <h1 className="display-2 fw-bold mb-4">TOXIC RŌNIN</h1>
        <p className="lead mb-5">
          Embark on a perilous journey as Miyamoto Musashi, 
          the legendary swordsman whose path to glory is stained with the blood of his enemies.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <div className="btn btn-danger btn-lg d-flex align-items-center gap-2">
            <Console size={20} />
          </div>
          <button className="btn btn-outline-light btn-lg d-flex align-items-center gap-2">
            <Scroll size={20} />
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}