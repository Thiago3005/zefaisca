import React, { useState, useEffect } from 'react';
import { Enemy as EnemyData, EnemyType } from '../types';
import { SLIME_DISPLAY_WIDTH, SLIME_DISPLAY_HEIGHT, SLIME_SPRITE_NATIVE_WIDTH, SLIME_SPRITE_NATIVE_HEIGHT, HIT_FLASH_DURATION } from '../constants';
import audioManager from '../services/audioManager';

interface EnemyProps {
  enemy: EnemyData;
}

const getEnemyVisuals = (type: EnemyType): { emoji: string; colorClass: string, sizeClass?: string } => {
  switch (type) {
    case 'demon_shooter':
      return { emoji: '😈', colorClass: 'text-red-500', sizeClass: 'text-2xl' };
    case 'ghost_dasher':
      return { emoji: '👻', colorClass: 'text-sky-300', sizeClass: 'text-2xl animate-pulse_custom_slow' };
    case 'poop_tank':
      return { emoji: '💩', colorClass: 'text-yellow-700', sizeClass: 'text-3xl' };
    case 'alien_swarmer':
      return { emoji: '👽', colorClass: 'text-green-400', sizeClass: 'text-xl' };
    case 'robot_brute':
      return { emoji: '🤖', colorClass: 'text-slate-400', sizeClass: 'text-3xl' };
    case 'ufo_sniper':
      return { emoji: '🛸', colorClass: 'text-cyan-300', sizeClass: 'text-3xl' };
    case 'sombra_ofuscante': // New
      return { emoji: '🕶️', colorClass: 'text-gray-500', sizeClass: 'text-3xl animate-pulse_custom_fast' }; // Placeholder emoji
    case 'tecelao_gravitacional': // New
      return { emoji: '🌀', colorClass: 'text-indigo-400', sizeClass: 'text-3xl' }; // Placeholder emoji
    case 'sentinela_reparadora': // New
      return { emoji: '🧑‍⚕️', colorClass: 'text-pink-400', sizeClass: 'text-2xl' }; // Placeholder emoji
    case 'boss_celestial_guardian':
      return { emoji: '👹', colorClass: 'text-purple-600', sizeClass: 'text-5xl' };
    case 'shooter': 
      return { emoji: '👾', colorClass: 'text-purple-500', sizeClass: 'text-2xl' };
    case 'dasher': 
      return { emoji: '💨', colorClass: 'text-teal-400', sizeClass: 'text-2xl' };
    case 'slime': 
    default:
      return { emoji: '❓', colorClass: 'text-slate-200', sizeClass: 'text-2xl' };
  }
};

const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const healthPercentage = (enemy.hp / enemy.maxHp) * 100;
  const [isFlashing, setIsFlashing] = useState(false);
  const prevHpRef = React.useRef(enemy.hp);

  useEffect(() => {
    if (enemy.hp < prevHpRef.current && enemy.hp > 0) { // Took damage but not dead
      setIsFlashing(true);
      if (enemy.type === 'slime') {
        audioManager.playSound('enemy_hit_slime');
      } else if (enemy.isBoss) {
        audioManager.playSound('boss_hit');
      } else {
        audioManager.playSound('enemy_hit_generic');
      }
      const timer = setTimeout(() => setIsFlashing(false), HIT_FLASH_DURATION);
      return () => clearTimeout(timer);
    }
    prevHpRef.current = enemy.hp;
  }, [enemy.hp, enemy.type, enemy.isBoss]);


  let statusEffects = "";
  if (enemy.isStunnedUntil && enemy.isStunnedUntil > Date.now()) statusEffects += "opacity-50 ";
  if (enemy.isSlowed && enemy.isSlowed.until > Date.now()) statusEffects += "filter grayscale "; 
  if (enemy.isCursedUntil && enemy.isCursedUntil > Date.now()) statusEffects += "animate-pulse_custom_fast "; 
  if (isFlashing) statusEffects += "animate-hit_flash ";


  if (enemy.type === 'slime') {
    const frameWidth = enemy.spriteFrameWidth || SLIME_SPRITE_NATIVE_WIDTH;
    const frameHeight = enemy.spriteFrameHeight || SLIME_SPRITE_NATIVE_HEIGHT;
    const totalColumns = enemy.spriteTotalColumns || 1;
    
    const backgroundPositionX = -((enemy.currentFrame || 0) % totalColumns) * frameWidth;
    const backgroundPositionY = 0; 

    const slimeStyle: React.CSSProperties = {
      width: SLIME_DISPLAY_WIDTH,
      height: SLIME_DISPLAY_HEIGHT,
      backgroundImage: `url(${enemy.spriteSheetUrl})`,
      backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
      backgroundSize: `${totalColumns * frameWidth}px ${frameHeight}px`, 
      imageRendering: 'pixelated',
      transform: enemy.facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      zIndex: 9,
    };

    return (
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          left: enemy.x,
          top: enemy.y,
          width: SLIME_DISPLAY_WIDTH, 
          height: SLIME_DISPLAY_HEIGHT,
        }}
      >
        <div className={statusEffects} style={slimeStyle} />
        {enemy.animationState !== 'die' && (
          <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-slate-700 rounded-sm overflow-hidden border border-slate-600">
            <div
              className="h-full bg-red-600 transition-all duration-200" 
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  const visuals = getEnemyVisuals(enemy.type);
  return (
    <div
      className="absolute flex flex-col items-center justify-center"
      style={{
        left: enemy.x,
        top: enemy.y,
        width: enemy.width,
        height: enemy.height,
        zIndex: 9, 
      }}
    >
      <div 
        className={`flex items-center justify-center ${statusEffects} ${visuals.colorClass} ${visuals.sizeClass || 'text-2xl'}`}
        style={{ width: '100%', height: '80%'}} 
      >
        {visuals.emoji}
      </div>
      
      <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-slate-700 rounded-sm overflow-hidden border border-slate-600">
        <div
          className="h-full bg-red-600 transition-all duration-200" 
          style={{ width: `${healthPercentage}%` }}
        />
      </div>
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
        .animate-hit_flash {
            animation: hit_flash_anim ${HIT_FLASH_DURATION}ms linear;
        }
        @keyframes hit_flash_anim {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(2.5) contrast(1.5); }
        }
      `}</style>
    </div>
  );
};

export default Enemy;