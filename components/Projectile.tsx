
import React from 'react';
import { Projectile as ProjectileData } from '../types';
import { BASE_PROJECTILE_WIDTH, BASE_PROJECTILE_HEIGHT, GAME_HEIGHT, SHRAPNEL_PROJECTILE_SIZE, ALIEN_SPIT_WIDTH, ALIEN_SPIT_HEIGHT, PIPOCA_SOUL_FRAGMENT_SIZE } from '../constants'; 

interface ProjectileProps {
  projectile: ProjectileData;
}

const Projectile: React.FC<ProjectileProps> = ({ projectile }) => {
  let width = projectile.width;
  let height = projectile.height;
  let content;
  let projectileSpecificClass = "";
  let zIndex = projectile.isPlayerProjectile ? 20 : 19; 

  switch (projectile.visualType) {
    case 'chinelo':
      width = 24; height = 12; 
      content = <span style={{ fontSize: `${Math.min(width,height)*0.8}px`, display: 'inline-block', transform: projectile.vx && projectile.vx < 0 ? 'scaleX(-1)' : '' }}>🩴</span>;
      break;
    case 'pipoca_kernel':
      width = 8; height = 8;
      content = <div className="w-full h-full bg-yellow-400 rounded-full shadow-sm" />;
      break;
    case 'pipoca_fragment': // New
      width = PIPOCA_SOUL_FRAGMENT_SIZE; height = PIPOCA_SOUL_FRAGMENT_SIZE;
      content = <div className="w-full h-full bg-orange-400 rounded-sm shadow-xs" />;
      zIndex = 19; // slightly lower than main player projectiles
      break;
    case 'soap_bubble':
      width = 20; height = 20;
      content = (
        <div className="w-full h-full rounded-full border-2 border-blue-300 bg-blue-400 bg-opacity-30 relative overflow-hidden animate-pulse">
          <div className="absolute w-1/3 h-1/3 bg-white opacity-50 rounded-full top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-1/4 h-1/4 bg-white opacity-30 rounded-full bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2" />
        </div>
      );
      break;
    case 'plunger':
      width = 18; height = 18; 
      content = <span style={{ fontSize: `${Math.min(width,height)*0.9}px`, display: 'inline-block' }}>🪠</span>;
      break;
    case 'slipper':
      width = 22; height = 12;
      content = <span style={{ fontSize: `${Math.min(width,height)*0.8}px`, display: 'inline-block', transform: projectile.vx && projectile.vx < 0 ? 'scaleX(-1)' : '' }}>👟</span>;
      break;
    case 'chicken':
      width = 20; height = 20;
      projectileSpecificClass="animate-bounce";
      content = <span style={{ fontSize: `${Math.min(width,height)}px`, display: 'inline-block' }}>🐔</span>;
      break;
    case 'lightning_bolt':
      width = 20; height = GAME_HEIGHT; 
      content = (
        <div className="w-full h-full bg-yellow-300 opacity-75 animate-pulse_fast">
          <div className="absolute inset-0 bg-white opacity-50 filter blur-sm"></div>
        </div>
      );
      zIndex = 5; 
      break;
    case 'shrapnel':
      width = SHRAPNEL_PROJECTILE_SIZE; height = SHRAPNEL_PROJECTILE_SIZE;
      content = <div className="w-full h-full bg-gray-400 rounded-sm rotate-45" />;
      zIndex = 18; 
      break;
    case 'alien_spit':
      width = ALIEN_SPIT_WIDTH; height = ALIEN_SPIT_HEIGHT;
      content = <div className="w-full h-full bg-lime-500 rounded-full opacity-80 shadow-sm border border-lime-700" />;
      zIndex = 19;
      break;
    case 'boss_homing_projectile':
      width = 22; height = 22;
      content = <div className="w-full h-full bg-purple-600 rounded-full border-2 border-purple-400 shadow-lg shadow-purple-500/70 animate-pulse_custom_slow" />;
      zIndex = 21; 
      break;
    case 'boss_beam_segment': 
      width = projectile.width; 
      height = projectile.height; 
      content = <div className="w-full h-full bg-red-500 opacity-60 animate-pulse_custom_fast" />;
      zIndex = 15; 
      break;
    case 'ufo_projectile':
      width = 10; height = 10;
      content = <div className="w-full h-full bg-cyan-400 rounded-full border-2 border-cyan-200 shadow-md shadow-cyan-500/50" />;
      zIndex = 19;
      break;
    case 'friction_spark':
      width = 8; height = 18; // Tall thin spark
      content = (
        <div 
            className="w-full h-full rounded-t-full rounded-b-sm bg-gradient-to-b from-orange-400 via-red-500 to-yellow-500 animate-pulse_fast"
            style={{ boxShadow: `0 0 6px 1px #FF8C00aa` }}
        />
      );
      zIndex = 20;
      break;
    case 'default_magic': 
    default:
      width = BASE_PROJECTILE_WIDTH; height = BASE_PROJECTILE_HEIGHT;
      content = (
        <div
          className="w-full h-full rounded" 
          style={{
            backgroundColor: projectile.color, 
            boxShadow: `0 0 8px 2px ${projectile.color}aa`,
          }}
        />
      );
      break;
  }
  
  let rotationAngle = 0;
  if (projectile.vx !== undefined && projectile.vy !== undefined) {
      if (projectile.visualType === 'default_magic' || 
          projectile.visualType === 'pipoca_kernel' || 
          projectile.visualType === 'pipoca_fragment' ||
          projectile.visualType === 'shrapnel' ||
          projectile.visualType === 'ufo_projectile' ||
          projectile.visualType === 'alien_spit' || 
          projectile.visualType === 'boss_beam_segment' ||
          projectile.visualType === 'friction_spark' // Friction spark also points up
      ) {
        rotationAngle = Math.atan2(projectile.vy, projectile.vx) * (180 / Math.PI);
         if (projectile.visualType === 'default_magic' || 
             projectile.visualType === 'boss_beam_segment' || 
             projectile.visualType === 'ufo_projectile' ||
             projectile.visualType === 'friction_spark' 
            ) {
            rotationAngle += 90; 
         }
      }
  }

  return (
    <div
      className={`absolute flex items-center justify-center ${projectileSpecificClass}`}
      style={{
        left: projectile.x - width / 2, 
        top: projectile.y - height / 2,
        width: width,
        height: height,
        transform: `rotate(${rotationAngle}deg)`,
        zIndex: zIndex,
      }}
    >
      {content}
       <style>{`
        .animate-pulse_custom_slow {
          animation: pulse_custom 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
         .animate-pulse_custom_fast {
          animation: pulse_custom 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse_custom {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default Projectile;