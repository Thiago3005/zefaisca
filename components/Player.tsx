import React, { useState, useEffect, useMemo } from 'react';
import { Player as PlayerData } from '../types';
import { 
    SPRITE_SHEET_URL, 
    PLAYER_ANIMATION_CONFIG,
    PLAYER_SPRITE_DISPLAY_WIDTH, 
    PLAYER_SPRITE_DISPLAY_HEIGHT, 
    SPRITE_SHEET_TOTAL_COLUMNS_ASSUMED, 
    SPRITE_SHEET_TOTAL_ROWS_ASSUMED,    
} from '../constants'; 

interface PlayerProps {
  player: PlayerData;
}

type AnimationName = keyof typeof PLAYER_ANIMATION_CONFIG;

const Player: React.FC<PlayerProps> = ({ player }) => {
  const [currentAnimationName, setCurrentAnimationName] = useState<AnimationName>('idle');
  const [currentFrame, setCurrentFrame] = useState(0);

  const invulnerableEffect = player.isInvulnerable ? 'animate-player_invulnerable_pulse' : 'opacity-100';
  
  const actualDisplayWidth = PLAYER_SPRITE_DISPLAY_WIDTH * player.stats.playerSizeMultiplier;
  const actualDisplayHeight = PLAYER_SPRITE_DISPLAY_HEIGHT * player.stats.playerSizeMultiplier;

  useEffect(() => {
    if (!player.isOnGround) {
      setCurrentAnimationName('jump_pose');
    } else if (player.vx !== 0) {
      setCurrentAnimationName('walk');
    } else {
      setCurrentAnimationName('idle');
    }
  }, [player.isOnGround, player.vx]);

  useEffect(() => {
    const animation = PLAYER_ANIMATION_CONFIG[currentAnimationName];
    setCurrentFrame(0); 

    const frameInterval = setInterval(() => {
      setCurrentFrame(prevFrame => (prevFrame + 1) % animation.frames);
    }, animation.frameRate);

    return () => clearInterval(frameInterval);
  }, [currentAnimationName]);

  const animation = PLAYER_ANIMATION_CONFIG[currentAnimationName];
  const frameCol = currentFrame; 
  const frameRow = animation.row;

  const backgroundPositionX = -(frameCol * actualDisplayWidth);
  const backgroundPositionY = -(frameRow * actualDisplayHeight);
  
  const backgroundSizeX = SPRITE_SHEET_TOTAL_COLUMNS_ASSUMED * actualDisplayWidth;
  const backgroundSizeY = SPRITE_SHEET_TOTAL_ROWS_ASSUMED * actualDisplayHeight;

  const playerStyle: React.CSSProperties = {
    left: player.x,
    top: player.y,
    width: Math.round(actualDisplayWidth), 
    height: Math.round(actualDisplayHeight), 
    backgroundImage: `url(${SPRITE_SHEET_URL})`,
    backgroundPosition: `${Math.round(backgroundPositionX)}px ${Math.round(backgroundPositionY)}px`, 
    backgroundSize: `${Math.round(backgroundSizeX)}px ${Math.round(backgroundSizeY)}px`, 
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated', 
    transform: player.facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
    transformOrigin: 'center center',
    transition: 'opacity 0.1s linear', 
    zIndex: 10,
  };

  return (
    <div
      className={`absolute ${invulnerableEffect}`}
      style={playerStyle}
      role="img"
      aria-label="Zé Faísca player character"
    >
      {/* Shield Visual (formerly barrier) */}
      {player.stats.shield.enabled && player.stats.shield.active && (
         <div 
            className="absolute rounded-full animate-shield_pulse"
            style={{
                width: actualDisplayWidth * 1.5, 
                height: actualDisplayHeight * 1.5,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 200, 255, 0.15)',
                border: '2px solid rgba(0, 220, 255, 0.6)',
                boxShadow: '0 0 10px rgba(0, 220, 255, 0.4)',
                zIndex: -1, 
            }}
         />
      )}

      <style>{`
        .animate-player_invulnerable_pulse { 
          animation: player_invulnerable_pulse_anim 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes player_invulnerable_pulse_anim { 
          0%, 100% { opacity: 0.75; } 
          50% { opacity: 0.45; }   
        }
        
        .animate-ping_fast {
            animation: ping_custom 0.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping_slow {
            animation: ping_custom 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping_custom {
            75%, 100% {
                transform: scale(2);
                opacity: 0;
            }
        }
         .animate-shield_pulse { /* Renamed to avoid conflict, specific for shield */
          animation: shield_pulse_anim 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes shield_pulse_anim {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Player;