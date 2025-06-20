
import React, { useState, useEffect } from 'react';
import { Staff, Accessory, AccessoryType } from '../types';
import { 
    STAFF_DEFINITIONS, ACCESSORY_DEFINITIONS, BRAZILIAN_STATES,
    PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT, PLAYER_HAT_HEIGHT,
    PLAYER_BEARD_HEIGHT, PLAYER_BEARD_WIDTH, PLAYER_VISUAL_OFFSET_Y,
    FLOATING_ACCESSORY_SIZE, FLOATING_ACCESSORY_OFFSET_Y, FLOATING_ACCESSORY_OPACITY,
    ON_HEAD_ACCESSORY_FONT_SIZE_MULTIPLIER
} from '../constants';
import { soundManager } from '../soundManager';

interface StartScreenProps {
  onStartGame: (selectedStaff: Staff, selectedAccessory: Accessory, playerName: string, playerState: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [currentStaffIndex, setCurrentStaffIndex] = useState<number>(0);
  const selectedStaff = STAFF_DEFINITIONS[currentStaffIndex];

  const [currentAccessoryIndex, setCurrentAccessoryIndex] = useState<number>(0);
  const selectedAccessory = ACCESSORY_DEFINITIONS[currentAccessoryIndex];

  const [playerName, setPlayerName] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  const handlePrevStaff = () => {
    soundManager.playUIClick();
    setCurrentStaffIndex(prev => (prev - 1 + STAFF_DEFINITIONS.length) % STAFF_DEFINITIONS.length);
  };

  const handleNextStaff = () => {
    soundManager.playUIClick();
    setCurrentStaffIndex(prev => (prev + 1) % STAFF_DEFINITIONS.length);
  };

  const handlePrevAccessory = () => {
    soundManager.playUIClick();
    setCurrentAccessoryIndex(prev => (prev - 1 + ACCESSORY_DEFINITIONS.length) % ACCESSORY_DEFINITIONS.length);
  };

  const handleNextAccessory = () => {
    soundManager.playUIClick();
    setCurrentAccessoryIndex(prev => (prev + 1) % ACCESSORY_DEFINITIONS.length);
  };
  
  const accessoryIsOnHead = selectedAccessory.renderStyle === 'on_head';
  const previewPlayerVisualHeight = PLAYER_BODY_HEIGHT + PLAYER_BEARD_HEIGHT + (accessoryIsOnHead ? PLAYER_HAT_HEIGHT : 0);
  const previewPlayerBaseStyle: React.CSSProperties = {
    position: 'relative', 
    width: PLAYER_BODY_WIDTH + 20, // Keep width consistent for centering
    height: previewPlayerVisualHeight + 30, 
    display: 'inline-block', 
    transform: 'scale(1.5)', 
    marginTop: '5px',
    marginBottom: '5px',
  };

  // Common styles for body, beard, eyes, mouth
  const bodyBaseTop = PLAYER_VISUAL_OFFSET_Y + (accessoryIsOnHead ? PLAYER_HAT_HEIGHT : 0) + PLAYER_BEARD_HEIGHT * 0.5;

  const wizardBeardStyle: React.CSSProperties = { 
    position: 'absolute',
    top: bodyBaseTop + PLAYER_BODY_HEIGHT * 0.1, // Adjusted to connect with body
    left: '50%',
    transform: 'translateX(-50%)',
    width: PLAYER_BEARD_WIDTH,
    height: PLAYER_BEARD_HEIGHT,
    backgroundColor: '#f0f0f0', 
    borderRadius: '0 0 40% 40%', 
    clipPath: 'polygon(10% 0, 90% 0, 85% 100%, 15% 100%)', 
    zIndex: 2, 
  };

  const wizardBodyStyle: React.CSSProperties = {
    position: 'absolute',
    top: bodyBaseTop + PLAYER_BEARD_HEIGHT * 0.6, // Body starts below beard top
    left: '50%',
    transform: 'translateX(-50%)',
    width: PLAYER_BODY_WIDTH,
    height: PLAYER_BODY_HEIGHT,
    backgroundColor: 'white', 
    clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)', 
    boxSizing: 'border-box',
    zIndex: 1,
  };
  
  const eyeBaseTop = bodyBaseTop + PLAYER_BODY_HEIGHT * 0.2;
  const wizardEyeStyle: React.CSSProperties = {
    position: 'absolute',
    top: eyeBaseTop, 
    left: '50%', 
    transform: 'translateX(-50%)',
    width: '6px',
    height: '6px',
    backgroundColor: '#2D3748', 
    borderRadius: '50%',
    zIndex: 4, 
  };

  const wizardMouthStyle: React.CSSProperties = {
    position: 'absolute',
    top: eyeBaseTop + 10, 
    left: '50%',
    transform: 'translateX(-50%)',
    width: '10px',
    height: '2px',
    backgroundColor: '#4A5568', 
    borderRadius: '1px',
    zIndex: 4,
  };

  const wizardStaffPreviewStyle: React.CSSProperties = {
    position: 'absolute',
    top: bodyBaseTop + PLAYER_BEARD_HEIGHT + PLAYER_BODY_HEIGHT * 0.3,
    left: '70%', 
    fontSize: '28px',
    transform: 'rotate(20deg)', 
    zIndex: 5, 
    color: 'white', 
  };

  const onHeadAccessoryStyle: React.CSSProperties = {
    position: 'absolute',
    top: PLAYER_VISUAL_OFFSET_Y, // Hat is at the very top
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: `${PLAYER_HAT_HEIGHT * ON_HEAD_ACCESSORY_FONT_SIZE_MULTIPLIER}px`, 
    lineHeight: '1',
    zIndex: 3, 
  };

  const floatingAccessoryStyle: React.CSSProperties = {
    position: 'absolute',
    top: PLAYER_VISUAL_OFFSET_Y + (accessoryIsOnHead ? PLAYER_HAT_HEIGHT * 0.5 : 0) + FLOATING_ACCESSORY_OFFSET_Y, // Position relative to where head would be
    left: `calc(50% + ${PLAYER_BODY_WIDTH / 2 + 5}px)`, // To the right of the body center
    transform: 'translateX(-50%)', // Center the icon itself
    fontSize: `${FLOATING_ACCESSORY_SIZE}px`,
    opacity: FLOATING_ACCESSORY_OPACITY,
    zIndex: 3,
    lineHeight: '1',
  };


  const isStartDisabled = !playerName.trim() || !selectedState;

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 text-white relative bg-black overflow-y-auto custom-scrollbar"
    >
      <div className="bg-slate-800 bg-opacity-90 p-6 sm:p-10 rounded-xl shadow-2xl text-center w-full max-w-xl border-2 border-slate-700">
        <h1 className="text-5xl sm:text-6xl font-bold mb-3 text-yellow-400 tracking-tight" style={{ fontFamily: "'MS Gothic', 'Osaka-mono', 'monospace', 'Courier New', 'monospace'"}}>
          Zé Faísca
        </h1>
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-orange-400 tracking-tight" style={{ fontFamily: "'MS Gothic', 'Osaka-mono', 'monospace', 'Courier New', 'monospace'"}}>
          Batalha Celestial
        </h2>

        <div className="my-4 p-4 border-2 border-slate-600 rounded-lg bg-slate-700 bg-opacity-60 w-full max-w-lg mx-auto">
          <h3 className="text-xl font-semibold mb-3 text-center text-teal-300">Identificação do Jogador</h3>
          <div className="mb-3">
            <label htmlFor="playerName" className="block text-sm font-medium text-slate-300 mb-1">Seu Nome:</label>
            <input 
              type="text" 
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="p-2 w-full rounded-md bg-slate-600 border border-slate-500 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              placeholder="Ex: Zé das Couves"
            />
          </div>
          <div>
            <label htmlFor="playerState" className="block text-sm font-medium text-slate-300 mb-1">Seu Estado:</label>
            <select 
              id="playerState"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="p-2 w-full rounded-md bg-slate-600 border border-slate-500 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23CBD5E1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '0.65em auto', paddingRight: '2.5rem' }}
            >
              <option value="" disabled>Selecione seu estado</option>
              {BRAZILIAN_STATES.map(state => (
                <option key={state.abbr} value={state.abbr}>{state.name} ({state.abbr})</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="my-4 p-4 border-2 border-slate-600 rounded-lg bg-slate-700 bg-opacity-60 w-full max-w-lg mx-auto">
          <h3 className="text-xl font-semibold mb-3 text-center text-yellow-300">Escolha seu Cajado:</h3>
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={handlePrevStaff} 
              className="p-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Cajado Anterior"
            >
              ᐊ
            </button>
            <div className="text-center mx-2 sm:mx-4 flex-grow min-h-[120px] flex flex-col justify-center">
              <div className="text-5xl mb-1 flex items-center justify-center h-16">{selectedStaff.icon}</div>
              <h4 className="text-lg font-bold text-yellow-400 truncate" title={selectedStaff.name}>{selectedStaff.name}</h4>
              <p className="text-xs text-slate-300 h-10 overflow-y-auto px-1 custom-scrollbar">{selectedStaff.description}</p>
            </div>
            <button 
              onClick={handleNextStaff} 
              className="p-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Próximo Cajado"
            >
              ᐅ
            </button>
          </div>
        </div>

        <div className="my-4 p-4 border-2 border-slate-600 rounded-lg bg-slate-700 bg-opacity-60 w-full max-w-lg mx-auto">
          <h3 className="text-xl font-semibold mb-3 text-center text-sky-300">Escolha seu Acessório:</h3>
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={handlePrevAccessory} 
              className="p-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Acessório Anterior"
            >
              ᐊ
            </button>
            <div className="text-center mx-2 sm:mx-4 flex-grow min-h-[120px] flex flex-col justify-center">
              <div className="text-5xl mb-1 flex items-center justify-center h-16">{selectedAccessory.icon}</div>
              <h4 className="text-lg font-bold text-sky-400 truncate" title={selectedAccessory.name}>{selectedAccessory.name}</h4>
              <p className="text-xs text-slate-300 h-10 overflow-y-auto px-1 custom-scrollbar">{selectedAccessory.description}</p>
            </div>
            <button 
              onClick={handleNextAccessory} 
              className="p-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Próximo Acessório"
            >
              ᐅ
            </button>
          </div>
        </div>

        <div className="my-6 text-center h-40 flex flex-col items-center justify-center" aria-label="Pré-visualização do Personagem">
            <p className="text-sm text-slate-400 mb-2">Zé Faísca com {selectedStaff.name} e {selectedAccessory.name}:</p>
            <div style={previewPlayerBaseStyle}>
              {selectedAccessory.renderStyle === 'on_head' && (
                <div style={onHeadAccessoryStyle}>{selectedAccessory.icon}</div>
              )}
              {selectedAccessory.renderStyle === 'floating_icon' && (
                <div style={floatingAccessoryStyle}>{selectedAccessory.icon}</div>
              )}
              <div style={wizardBeardStyle} />
              <div style={wizardBodyStyle} />
              <div style={{...wizardEyeStyle, left: 'calc(50% - 4px)' }} /> {/* Left Eye */}
              <div style={{...wizardEyeStyle, left: 'calc(50% + 4px)' }} /> {/* Right Eye */}
              <div style={wizardMouthStyle} />
              <div style={wizardStaffPreviewStyle}>{selectedStaff.icon || '🪄'}</div>
            </div>
        </div>

        <button
          onClick={() => {
            if (isStartDisabled) return;
            soundManager.playUIClick();
            onStartGame(selectedStaff, selectedAccessory, playerName, selectedState);
          }}
          disabled={isStartDisabled}
          className={`mt-4 px-10 py-4 font-bold text-xl sm:text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-opacity-75
            ${isStartDisabled 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white focus:ring-2 focus:ring-green-300'}`}
        >
          Iniciar Jogo!
        </button>
        {isStartDisabled && <p className="mt-2 text-xs text-red-400">Por favor, preencha seu nome e selecione um estado.</p>}
        <p className="mt-3 text-xs text-slate-400">Setas/WASD para mover. Mouse para mirar. Clique para atacar. X/Shift também ataca.</p>
      </div>
      <p className="absolute bottom-2 left-2 text-xs text-slate-500 opacity-70">v0.5.1</p> 
    </div>
  );
};

export default StartScreen;