
import React, { useState, useCallback, useEffect } from 'react';
import { GameStatus, Staff, Accessory } from './types'; // Added Accessory
import GameView from './views/GameView';
import MainMenuView from './views/MainMenuView';
import GameOverModal from './components/GameOverModal';
import { GAME_WIDTH, GAME_HEIGHT, STAVES, ACCESSORIES } from './constants'; // Added ACCESSORIES
import audioManager from './services/audioManager'; // Import AudioManager

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.MainMenu);
  const [lastScore, setLastScore] = useState(0);
  const [lastLevel, setLastLevel] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null); // New state for accessory
  const [isEligibleForRanking, setIsEligibleForRanking] = useState(true);

  // Ensure AudioContext is initialized on first user interaction
  useEffect(() => {
    const initAudio = () => {
      audioManager.ensureAudioContext();
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true }); // Also on keydown
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);


  const startGame = useCallback((staff: Staff, accessory: Accessory) => {
    setSelectedStaff(staff);
    setSelectedAccessory(accessory);
    setIsEligibleForRanking(accessory.id !== 'cartola_vigarista');
    setGameStatus(GameStatus.Playing);
    audioManager.stopSound('menu_music');
    audioManager.playSound('ambient_music_game', { loop: true, id: 'game_music' });
  }, []);

  const showGameOver = useCallback((score: number, level: number) => {
    setLastScore(score);
    setLastLevel(level);
    setGameStatus(GameStatus.GameOver);
    audioManager.stopSound('game_music');
    // audioManager.playSound('game_over_fanfare'); // This is played from GameView already
  }, []);

  const restartGame = useCallback(() => {
    if (selectedStaff && selectedAccessory) { 
        setGameStatus(GameStatus.Playing);
        audioManager.stopSound('menu_music'); // In case it was playing
        audioManager.playSound('ambient_music_game', { loop: true, id: 'game_music' });
    } else { 
        setGameStatus(GameStatus.MainMenu);
        audioManager.stopSound('game_music');
        audioManager.playSound('ambient_music_menu', { loop: true, id: 'menu_music' });
    }
  }, [selectedStaff, selectedAccessory]);

  const goToMainMenu = useCallback(() => {
    setSelectedStaff(null); 
    setSelectedAccessory(null); 
    setGameStatus(GameStatus.MainMenu);
    audioManager.stopSound('game_music');
    audioManager.playSound('ambient_music_menu', { loop: true, id: 'menu_music' });
  }, []);
  
  // Play menu music when MainMenu is shown
  useEffect(() => {
    if (gameStatus === GameStatus.MainMenu) {
      audioManager.stopSound('game_music'); // Ensure game music is stopped
      audioManager.playSound('ambient_music_menu', { loop: true, id: 'menu_music' });
    }
  }, [gameStatus]);


  const gameViewKey = selectedStaff && selectedAccessory 
    ? `${gameStatus}-${selectedStaff.id}-${selectedAccessory.id}` 
    : `${gameStatus}`;


  return (
    <div 
      className="relative flex flex-col items-center justify-center w-screen h-screen bg-slate-950 overflow-hidden select-none"
    >
      {gameStatus === GameStatus.MainMenu && <MainMenuView onStartGame={startGame} />}
      
      { (gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused || gameStatus === GameStatus.GameOver) && selectedStaff && selectedAccessory && (
        <GameView 
            isEffectivelyPlaying={gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused}
            onGameOver={showGameOver} 
            selectedStaff={selectedStaff}
            selectedAccessory={selectedAccessory} // Pass accessory
            key={gameViewKey} 
        />
      )}

      {gameStatus === GameStatus.GameOver && (
        <GameOverModal
          score={lastScore}
          level={lastLevel}
          onRestart={restartGame}
          onMainMenu={goToMainMenu}
          isEligibleForRanking={isEligibleForRanking} // Pass eligibility
        />
      )}
       <div 
        className="absolute bottom-2 right-2 text-xs text-slate-500 opacity-50"
        style={{ width: GAME_WIDTH }} 
       >
        Zé Faísca: Batalha Celestial - Audio Synthesis Build
      </div>
    </div>
  );
};

export default App;
