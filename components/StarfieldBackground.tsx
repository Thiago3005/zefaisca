
import React, { useState, useEffect, useMemo } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  vy: number; // Vertical speed for parallax
}

const StarfieldBackground: React.FC = () => {
  const numStars = 200;
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const initialStars: Star[] = [];
    for (let i = 0; i < numStars; i++) {
      initialStars.push({
        id: i,
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        vy: Math.random() * 0.5 + 0.1, // Slower stars for depth
      });
    }
    setStars(initialStars);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStars(prevStars =>
        prevStars.map(star => {
          let newY = star.y + star.vy;
          if (newY > GAME_HEIGHT) {
            newY = 0; // Reset star to top
          }
          return { ...star, y: newY };
        })
      );
    }, 50); // Update roughly 20 FPS

    return () => clearInterval(interval);
  }, []);
  
  const backgroundStyle = useMemo(() => (
    `absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-950`
  ), []);


  return (
    <div className={backgroundStyle} style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-slate-300"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)', // Center the star
          }}
        />
      ))}
    </div>
  );
};

export default StarfieldBackground;