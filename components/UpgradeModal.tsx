import React from 'react';
import { Upgrade, PlayerStats } from '../types';
import UpgradeCard from './UpgradeCard';
import Button from './Button'; // Import Button
import audioManager from '../services/audioManager';

interface UpgradeModalProps {
  upgrades: Upgrade[];
  onSelectUpgrade: (upgrade: Upgrade) => void;
  playerStats: PlayerStats;
  onRerollUpgrades: () => void; // New callback for rerolling
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ upgrades, onSelectUpgrade, playerStats, onRerollUpgrades }) => {
  
  const handleRerollClick = () => {
    audioManager.playSound('ui_button_click', { volume: 0.7 }); // Example of specific volume for a sound
    onRerollUpgrades();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 p-8 rounded-xl shadow-2xl max-w-2xl w-full border-2 border-purple-500 transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400">LEVEL UP!</h2>
          {playerStats.rerollsAvailable > 0 && (
            <Button 
              onClick={handleRerollClick} // Use wrapped handler
              variant="secondary"
              className="text-sm py-2 px-3"
            >
              Re-rolar ({playerStats.rerollsAvailable}) <span role="img" aria-label="dice">🎲</span>
            </Button>
          )}
        </div>
        <p className="text-center text-slate-300 mb-6 -mt-4">Escolha um upgrade:</p>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {upgrades.map(upgrade => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onSelect={() => {
                audioManager.playSound('upgrade_select');
                onSelectUpgrade(upgrade);
              }}
              currentLevel={playerStats.ownedUpgrades[upgrade.id] || 0}
            />
          ))}
        </div>
      </div>
      <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.8); /* slate-800 with opacity */
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a78bfa; /* purple-400 */
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #c4b5fd; /* purple-300 */
          }
        `}</style>
    </div>
  );
};

export default UpgradeModal;