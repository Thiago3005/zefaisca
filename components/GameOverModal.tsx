import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { fetchTop10, submitScore } from '../services/apiService';
import Button from './Button';
import audioManager from '../services/audioManager';

interface GameOverModalProps {
  score: number; 
  level: number;
  onRestart: () => void;
  onMainMenu: () => void;
  isEligibleForRanking: boolean; // New prop
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, level, onRestart, onMainMenu, isEligibleForRanking }) => {
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: ''});
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      const top10 = await fetchTop10();
      setLeaderboard(top10.map((entry, index) => ({...entry, rank: index + 1})));
      setLoadingLeaderboard(false);
    };
    loadLeaderboard();
  }, [scoreSubmitted]); 

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || scoreSubmitted || !isEligibleForRanking) return;

    audioManager.playSound('ui_button_click'); // Sound for submit attempt
    setSubmissionStatus({ message: 'Submetendo...', type: '' });
    const result = await submitScore(playerName, score);
    setSubmissionStatus({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setScoreSubmitted(true);
      // audioManager.playSound('score_submit_success'); // Optional: specific success sound
    } else {
      // audioManager.playSound('score_submit_fail'); // Optional: specific fail sound
    }
  };
  
  const formattedTime = `${Math.floor(score / 60)}m ${score % 60}s`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg md:max-w-2xl border-2 border-red-600 transform transition-all duration-300">
        <h2 className="text-4xl font-bold text-center mb-4 text-red-500">GAME OVER</h2>
        <p className="text-center text-xl text-slate-300 mb-1">Você alcançou o Nível <span className="text-yellow-400">{level}</span></p>
        <p className="text-center text-xl text-slate-300 mb-6">Sobreviveu por <span className="text-yellow-400">{formattedTime}</span></p>

        {!isEligibleForRanking && (
          <p className="text-center text-orange-400 mb-4 text-sm">
            Sua pontuação não é elegível para o ranking devido ao acessório escolhido (🎩).
          </p>
        )}

        {isEligibleForRanking && !scoreSubmitted && (
          <form onSubmit={handleSubmitScore} className="mb-6">
            <label htmlFor="playerNameInput" className="block text-sm font-medium text-slate-300 mb-1">
              Digite seu nome para o placar:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="playerNameInput"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Zé Faísca Jr."
                maxLength={20}
                className="flex-grow p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                required
              />
              <Button type="submit" variant="primary" className="px-4" disabled={!playerName.trim()}>
                Enviar
              </Button>
            </div>
            {submissionStatus.message && (
              <p className={`mt-2 text-sm text-center ${submissionStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {submissionStatus.message}
              </p>
            )}
          </form>
        )}
        {scoreSubmitted && submissionStatus.message && (
            <p className={`mb-4 text-sm text-center ${submissionStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {submissionStatus.message}
            </p>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-center mb-3 text-cyan-400">TOP 10 SOBREVIVENTES</h3>
          {loadingLeaderboard ? (
            <p className="text-center text-slate-400">Carregando placar...</p>
          ) : leaderboard.length > 0 ? (
            <ul className="space-y-1 max-h-48 overflow-y-auto bg-slate-800 p-3 rounded-md border border-slate-700">
              {leaderboard.map((entry) => (
                <li key={entry.id || entry.name} className="flex justify-between items-center text-sm p-1.5 rounded bg-slate-700/50">
                  <span className="font-medium text-slate-200">
                    {entry.rank}. {entry.name}
                  </span>
                  <span className="text-yellow-500">{entry.total_hours.toFixed(2)} hrs</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-400">Nenhuma pontuação ainda. Seja o primeiro!</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button onClick={onRestart} variant="primary" className="w-full sm:w-auto">
            Reiniciar Jogo
          </Button>
          <Button onClick={onMainMenu} variant="secondary" className="w-full sm:w-auto">
            Menu Principal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;