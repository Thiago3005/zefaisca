
import React, { useState } from 'react';
import Button from '../components/Button';
import StarfieldBackground from '../components/StarfieldBackground';
import { GAME_WIDTH, GAME_HEIGHT, STAVES, ACCESSORIES } from '../constants'; 
import { Staff, Accessory } from '../types'; 
import EncyclopediaView from '../components/EncyclopediaView'; // Importa a nova view

interface MainMenuViewProps {
  onStartGame: (selectedStaff: Staff, selectedAccessory: Accessory) => void; 
}

type MainMenuSubView = 'gameSetup' | 'encyclopedia';

const ItemCard: React.FC<{ item: Staff | Accessory; onSelect: () => void; isSelected: boolean; typeLabel: string }> = ({ item, onSelect, isSelected }) => (
  <button
    onClick={onSelect}
    className={`p-3 md:p-4 rounded-lg shadow-md transition-all duration-200 w-full text-left border-2 ${
      isSelected ? 'border-yellow-400 scale-105 bg-purple-700 bg-opacity-50' : 'border-purple-600 hover:border-purple-400 bg-slate-800 bg-opacity-70'
    }`}
  >
    <h3 className="text-lg md:text-xl font-bold mb-1" style={{ color: isSelected ? '#FFFF00': '#E0E0E0' }}>{item.name}</h3>
    <p className="text-xs md:text-sm text-slate-300">{item.description}</p>
  </button>
);

const MainMenuView: React.FC<MainMenuViewProps> = ({ onStartGame }) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(STAVES[0]?.id || null); // Default to first staff
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(ACCESSORIES[0]?.id || null); // Default to first accessory
  const [currentView, setCurrentView] = useState<MainMenuSubView>('gameSetup');


  const handleStart = () => {
    if (selectedStaffId && selectedAccessoryId) {
      const staff = STAVES.find(s => s.id === selectedStaffId);
      const accessory = ACCESSORIES.find(a => a.id === selectedAccessoryId);
      if (staff && accessory) {
        onStartGame(staff, accessory); 
      }
    }
  };

  if (currentView === 'encyclopedia') {
    return (
      <div 
        className="relative flex flex-col items-center justify-center text-center p-4 md:p-8 rounded-lg shadow-2xl overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        <StarfieldBackground />
        <EncyclopediaView onClose={() => setCurrentView('gameSetup')} />
      </div>
    );
  }

  return (
    <div 
        className="relative flex flex-col items-center justify-center text-center p-4 md:p-8 rounded-lg shadow-2xl overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
    >
        <StarfieldBackground />
        <div className="relative z-10 bg-slate-900 bg-opacity-60 p-6 md:p-10 rounded-xl shadow-xl max-w-4xl w-full">
            <h1 className="text-5xl md:text-6xl font-bold mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                Zé Faísca
                </span>
                <span className="block text-3xl md:text-4xl text-cyan-400 mt-1">Batalha Celestial</span>
            </h1>
            <p className="text-slate-300 text-md md:text-lg mb-6">
                O cosmos te aguarda, Zé! Escolha seu equipamento e mostre quem manda!
            </p>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8">
              {/* Staff Selection */}
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl text-purple-400 font-semibold mb-2 md:mb-3">Escolha seu Cajado:</h2>
                <div className="grid grid-cols-1 gap-2 md:gap-3 max-h-48 md:max-h-60 overflow-y-auto p-1 md:p-2 rounded bg-slate-950 bg-opacity-30 custom-scrollbar">
                  {STAVES.map(staff => (
                    <ItemCard 
                      key={staff.id} 
                      item={staff} 
                      onSelect={() => setSelectedStaffId(staff.id)}
                      isSelected={selectedStaffId === staff.id}
                      typeLabel="Cajado"
                    />
                  ))}
                </div>
              </div>

              {/* Accessory Selection */}
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl text-teal-400 font-semibold mb-2 md:mb-3">Escolha seu Acessório:</h2>
                <div className="grid grid-cols-1 gap-2 md:gap-3 max-h-48 md:max-h-60 overflow-y-auto p-1 md:p-2 rounded bg-slate-950 bg-opacity-30 custom-scrollbar">
                  {ACCESSORIES.map(accessory => (
                    <ItemCard 
                      key={accessory.id} 
                      item={accessory} 
                      onSelect={() => setSelectedAccessoryId(accessory.id)}
                      isSelected={selectedAccessoryId === accessory.id}
                      typeLabel="Acessório"
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button 
                onClick={handleStart} 
                variant="primary" 
                className="text-xl md:text-2xl px-8 py-3 md:px-10 md:py-4 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                disabled={!selectedStaffId || !selectedAccessoryId} 
              >
                  INICIAR BATALHA!
              </Button>
              <Button
                onClick={() => setCurrentView('encyclopedia')}
                variant="secondary"
                className="text-lg md:text-xl px-6 py-2.5 md:px-8 md:py-3 w-full sm:w-auto"
              >
                Enciclopédia 📖
              </Button>
            </div>
            <p className="mt-8 text-xs text-slate-400">
                Use <span className="text-yellow-300">WASD</span> ou <span className="text-yellow-300">Setas</span> para Mover. <span className="text-yellow-300">Clique</span> para Atirar.
            </p>
        </div>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(51, 65, 85, 0.5); 
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #8b5cf6; 
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a78bfa; 
          }
        `}</style>
    </div>
  );
};

export default MainMenuView;
