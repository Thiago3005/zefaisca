
import React from 'react';
import { Upgrade, Rarity } from '../types';

interface UpgradeCardProps {
  upgrade: Upgrade;
  onSelect: () => void;
  currentLevel: number;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ upgrade, onSelect, currentLevel }) => {
  const isCelestial = upgrade.rarity === Rarity.Celestial;
  const isAscension = upgrade.rarity === Rarity.Ascension;
  const isEpic = upgrade.rarity === Rarity.Epic;

  let borderColorClass = `border-[${upgrade.color}]`;
  let shadowBox = `0 0 15px ${upgrade.color}33`;
  let titleColorClass = `text-[${upgrade.color}]`;
  let rarityTextColor = '#FFF';
  let backgroundColor = 'rgba(30, 41, 59, 0.9)'; // Default slate-800 with opacity

  if (isCelestial) {
    borderColorClass = 'border-yellow-400 animate-celestial_border_pulse';
    shadowBox = `0 0 25px ${upgrade.color}77`;
    titleColorClass = 'text-yellow-300';
    rarityTextColor = '#000';
    backgroundColor = 'rgba(50, 40, 80, 0.95)';
  } else if (isAscension) {
    borderColorClass = 'border-purple-400 animate-ascension_border_pulse';
    shadowBox = `0 0 30px #DA70D6bb`; // Magenta/Orchid glow
    titleColorClass = 'text-fuchsia-400'; // Magenta text
    rarityTextColor = '#FFF';
    backgroundColor = 'rgba(60, 20, 70, 0.95)'; // Dark purple background
  } else if (isEpic) {
    borderColorClass = `border-sky-400`; // Epic items have sky blue border
    shadowBox = `0 0 20px #0ea5e966`; // Sky blue glow
    titleColorClass = `text-sky-300`;
    rarityTextColor = '#FFF';
    backgroundColor = 'rgba(23, 50, 77, 0.95)'; // Darker blue background
  }


  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 ${borderColorClass}`}
      style={{
        backgroundColor: backgroundColor,
        borderWidth: '2px',
        boxShadow: shadowBox
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className={`text-xl font-bold ${titleColorClass}`}>
          {upgrade.name} 
          {isCelestial && <span className="text-yellow-400 ml-1">🌌</span>}
          {isAscension && <span className="text-fuchsia-400 ml-1">🌠</span>}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: upgrade.color, color: rarityTextColor }}>
          {upgrade.rarity.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-slate-300 mb-2">{upgrade.desc}</p>
      <p className="text-xs text-yellow-400">Current Level: {currentLevel} {upgrade.maxLevel ? `/ ${upgrade.maxLevel}` : ''}</p>
      {(isCelestial || isAscension) && (
        <style>{`
          ${isCelestial ? `
          @keyframes celestial_border_pulse {
            0%, 100% { border-color: ${upgrade.color}; box-shadow: ${shadowBox}; }
            50% { border-color: #FFD700; box-shadow: 0 0 35px #FFD70099; }
          }` : ''}
          ${isAscension ? `
          @keyframes ascension_border_pulse {
            0%, 100% { border-color: #DA70D6; box-shadow: ${shadowBox}; }
            50% { border-color: #FF00FF; box-shadow: 0 0 40px #FF00FFcc; }
          }` : ''}
        `}</style>
      )}
    </button>
  );
};

export default UpgradeCard;
