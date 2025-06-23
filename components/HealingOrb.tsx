

import React from 'react';
import { HealingOrb as HealingOrbData } from '../types';

interface HealingOrbProps {
  orb: HealingOrbData;
}

const HealingOrbComponent: React.FC<HealingOrbProps> = ({ orb }) => {
  return (
    <div
      className="absolute rounded-full bg-green-500 animate-pulse border-2 border-green-300 shadow-lg shadow-green-500/50"
      style={{
        left: orb.x,
        top: orb.y,
        width: orb.width,
        height: orb.height,
        zIndex: 8, // Ensure orbs are above ground, potentially behind player/enemies
      }}
    />
  );
};

const MemoizedHealingOrb = React.memo(HealingOrbComponent, (prevProps, nextProps) => {
  return (
    prevProps.orb.id === nextProps.orb.id &&
    prevProps.orb.x === nextProps.orb.x &&
    prevProps.orb.y === nextProps.orb.y
  );
});

export default MemoizedHealingOrb;
