import React from 'react';

export function Story() {
  return (
    <div className="py-5 bg-dark">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center text-white">
            <h2 className="display-6 mb-4">The Path of the Sword</h2>
            <p className="lead text-white-50 mb-4">
              After defeating two warriors of the prestigious Yoshioka school, 
              Miyamoto Musashi must face the consequences of his actions. 
              Now hunted by those who seek revenge, every shadow could hide an assassin, 
              every moment could be your last.
            </p>
            <div className="text-danger fw-bold fs-4">
              Will you survive the path to becoming a legend?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}