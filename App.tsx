
import React, { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import { GameState, Staff, Accessory } from './types';
import { STAFF_DEFINITIONS, ACCESSORY_DEFINITIONS } from './constants';
import { soundManager } from './soundManager';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState<Staff>(STAFF_DEFINITIONS[0]);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory>(ACCESSORY_DEFINITIONS[0]);
  const [playerName, setPlayerName] = useState<string>('');
  const [playerState, setPlayerState] = useState<string>('');


  const handleStartGame = useCallback((staff: Staff, accessory: Accessory, name: string, state: string) => {
    soundManager.init(); // Initialize AudioContext on user gesture
    setSelectedStaff(staff);
    setSelectedAccessory(accessory);
    setPlayerName(name);
    setPlayerState(state);
    setScore(0);
    setWave(1); 
    setDurationMinutes(0);
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameOver = useCallback((finalScore: number, finalWave: number, finalDurationMinutes: number) => {
    setScore(finalScore);
    setWave(finalWave);
    setDurationMinutes(finalDurationMinutes);
    setGameState(GameState.GAME_OVER);
    soundManager.playGameOverSound();
  }, []);

  const handleRestart = useCallback(() => {
    soundManager.playUIClick();
    setGameState(GameState.MENU); 
  }, []);

  const isGameRankable = !selectedAccessory.effects.fedoraNoRanking;

  return (
    <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
      {gameState === GameState.MENU && <StartScreen onStartGame={handleStartGame} />}
      {gameState === GameState.PLAYING && <GameScreen onGameOver={handleGameOver} selectedStaff={selectedStaff} selectedAccessory={selectedAccessory} />}
      {gameState === GameState.GAME_OVER && (
        <GameOverScreen 
          playerName={playerName}
          playerState={playerState}
          score={score} 
          wave={wave} 
          durationMinutes={durationMinutes}
          onRestart={handleRestart} 
          isRankable={isGameRankable} 
        />
      )}
    </div>
  );
};

export default App;