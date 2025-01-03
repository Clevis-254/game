import React from 'react';
import { Sword } from 'lucide-react';

export function Features() {
  return (
    <div className="py-5 bg-dark bg-gradient">
      <div className="container">

        <div className="row g-4">
          <div className="col-md-4 text-center text-white">
            <Sword className="text-danger mb-3" size={48} />
            <h3 className="h4 mb-3">Master the Blade</h3>
            <p className="text-white-50">
                Perfect your swordsmanship through strategic combat and deadly precision.
            </p>
          </div>

          <div className="col-md-4 text-center text-white">
            <div className="text-danger mb-3 display-5">行</div>
            <h3 className="h4 mb-3">Honor & Revenge</h3>
            <p className="text-white-50">
              Navigate a world where honor means everything and revenge drives your enemies.
            </p>
          </div>

          <div className="col-md-4 text-center text-white">
            <div className="text-danger mb-3 display-5">侍</div>
            <h3 className="h4 mb-3">Feudal Japan</h3>
            <p className="text-white-50">
              Immerse yourself in a richly detailed world of samurai, honor, and betrayal.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}