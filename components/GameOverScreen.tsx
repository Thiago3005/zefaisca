
import React, { useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboardFromSupabase, submitScoreToSupabase } from '../supabaseService'; 
import { BRAZILIAN_STATES } from '../constants';

interface GameOverScreenProps {
  playerName: string;
  playerState: string; // UF/Abbreviation
  score: number;
  wave: number;
  durationMinutes: number;
  onRestart: () => void;
  isRankable: boolean;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  playerName, playerState, score, wave, durationMinutes, onRestart, isRankable 
}) => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchGlobalLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const board = await getLeaderboardFromSupabase();
      setGlobalLeaderboard(board);
    } catch (err) {
      console.error("Erro ao buscar placar global do Supabase:", err);
      setError("Não foi possível carregar o placar global. Tente novamente mais tarde.");
      setGlobalLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, [fetchGlobalLeaderboard]);

  const handleSubmitScore = async () => {
    if (!isRankable || submitted) return;
    if (playerName.trim() === '' || playerState.trim() === '') {
      setError("Nome do jogador ou estado inválido.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Formatar data para YYYY-MM-DD para o Supabase (tipo DATE)
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const formattedDateForSupabase = `${year}-${month}-${day}`;

      const newEntry: LeaderboardEntry = {
        id: new Date().toISOString(), // ID único para a entrada
        playerName: playerName.trim(),
        playerState: playerState,
        score,
        wave,
        durationMinutes,
        date: formattedDateForSupabase, // Data formatada para Supabase
      };

      await submitScoreToSupabase(newEntry);
      setSubmitted(true);
      // Recarregar o placar para mostrar a nova entrada
      await fetchGlobalLeaderboard(); 
    } catch (err) {
      console.error("Erro ao submeter pontuação para o Supabase:", err);
      setError("Falha ao salvar pontuação global. Verifique sua conexão ou tente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const canSubmitGlobalScore = isRankable && score > 0 && !submitted;
  const playerStateFullName = BRAZILIAN_STATES.find(s => s.abbr === playerState)?.name || playerState;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 custom-scrollbar overflow-y-auto">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl text-white w-full max-w-2xl text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-red-500">Fim de Jogo!</h2>
        
        <div className="text-lg sm:text-xl mb-4 bg-slate-700 p-4 rounded-lg shadow-inner">
            <p className="mb-1">Jogador: <span className="font-bold text-sky-300">{playerName} ({playerStateFullName})</span></p>
            <p className="mb-1">Pontuação Final: <span className="font-bold text-yellow-400">{score}</span></p>
            <p className="mb-1">Sobreviveu até a Onda: <span className="font-bold text-yellow-400">{wave}</span></p>
            <p>Tempo de Jogo: <span className="font-bold text-yellow-400">{durationMinutes} minuto(s)</span></p>
        </div>

        {!isRankable && (
            <p className="text-orange-400 mb-4 font-semibold text-sm">Este chapéu não permite registro no placar global!</p>
        )}

        {error && <p className="text-red-400 mb-3 text-sm">{error}</p>}

        {isRankable && !submitted && canSubmitGlobalScore && (
          <div className="mb-6">
            <button
              onClick={handleSubmitScore}
              disabled={isLoading}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 w-full max-w-xs mx-auto
                ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              {isLoading ? 'Salvando...' : 'Salvar Pontuação Global 🌍'}
            </button>
          </div>
        )}
        {isRankable && submitted && <p className="text-green-400 mb-4 text-lg">Pontuação Salva no Placar Global!</p>}
        
        <div className="mt-6 mb-6 w-full max-w-md mx-auto">
            <h3 className="text-2xl font-semibold mb-3 text-yellow-300">Placar Global dos Campeões 🏆</h3>
            {isLoading && globalLeaderboard.length === 0 && <p className="text-slate-400">Carregando placar...</p>}
            
            {globalLeaderboard.length > 0 ? (
                <ul className="bg-slate-700 p-3 sm:p-4 rounded-lg max-h-60 overflow-y-auto custom-scrollbar text-sm sm:text-base">
                {globalLeaderboard.map((entry, index) => (
                    <li key={entry.id || index} className={`flex justify-between items-center py-2 px-1 border-b border-slate-600 last:border-b-0 
                    ${index === 0 ? 'text-yellow-300' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : ''}
                    ${entry.playerName === playerName && entry.score === score && entry.wave === wave ? 'bg-slate-600 rounded' : ''}
                    `}>
                    <span className={`text-left w-1/12 font-semibold ${index < 3 ? 'text-lg' : ''}`}>{index + 1}.</span>
                    <span className="text-left w-4/12 truncate" title={`${entry.playerName} (${entry.playerState})`}>{entry.playerName} <span className="text-xs text-slate-400">({entry.playerState})</span></span>
                    <span className="text-right w-3/12 text-yellow-400">{entry.score} pts</span>
                    <span className="text-right w-2/12 text-blue-300">Onda {entry.wave}</span>
                    {/* A data agora é exibida como dd/MM/yyyy vinda do supabaseService */}
                    <span className="text-right w-2/12 text-purple-300">{entry.date}</span> 
                    </li>
                ))}
                </ul>
            ) : (!isLoading && !error && <p className="text-slate-400">Nenhuma pontuação no placar global ainda. Seja o primeiro!</p>)}
        </div>

        <button
          onClick={onRestart}
          disabled={isLoading}
          className={`px-8 py-4 font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105
            ${isLoading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
