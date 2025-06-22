
import React from 'react';
import { PlayerStats, Upgrade, Enemy as EnemyData, ActiveDynamicEvent } from '../types'; 
import { UPGRADES as ALL_UPGRADES_LIST, ENTROPIC_FRAGMENT_BUFF_PER_FRAGMENT } from '../constants'; 

interface HudProps {
  playerStats: PlayerStats;
  gameTime: number; 
  waveNumber: number;
  enemiesDefeatedInWave: number; 
  enemiesRequiredInWave: number; 
  bossEnemy?: EnemyData | null; 
  activeEvent?: ActiveDynamicEvent | null; // New prop for dynamic events
}

const Hud: React.FC<HudProps> = ({ playerStats, gameTime, waveNumber, enemiesDefeatedInWave, enemiesRequiredInWave, bossEnemy, activeEvent }) => {
  const hpPercentage = Math.max(0, (playerStats.currentHp / playerStats.maxHp) * 100);
  const bossHpPercentage = bossEnemy ? Math.max(0, (bossEnemy.hp / bossEnemy.maxHp) * 100) : 0;

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const ownedUpgradesToDisplay = Object.entries(playerStats.ownedUpgrades)
    .filter(([, level]) => level > 0)
    .map(([id, level]) => {
      const upgradeInfo = ALL_UPGRADES_LIST.find(u => u.id === id);
      return {
        id,
        level,
        icon: upgradeInfo?.icon || '❓',
        name: upgradeInfo?.name || 'Desconhecido',
        color: upgradeInfo?.color || '#FFFFFF',
      };
    });

  const entropicBuffPercent = playerStats.entropicBuffDuration > 0 
    ? Math.round(playerStats.collectedEntropicFragments * ENTROPIC_FRAGMENT_BUFF_PER_FRAGMENT * 100)
    : 0;

  return (
    <>
      {/* Boss Health Bar (Top Center) */}
      {bossEnemy && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3/5 max-w-md p-1.5 bg-slate-900 bg-opacity-80 rounded-lg shadow-xl border-2 border-purple-500 z-40">
          <div className="flex justify-between text-xs text-purple-300 mb-0.5 px-1">
            <span>CHEFE: {bossEnemy.type.replace(/_/g, ' ').toUpperCase()}</span>
            <span>{Math.ceil(bossEnemy.hp)} / {bossEnemy.maxHp}</span>
          </div>
          <div className="w-full h-4 sm:h-5 bg-slate-700 rounded overflow-hidden border border-slate-600">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${bossHpPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Event Indicator */}
      {activeEvent && (
        <div className="absolute top-2 right-2 p-2 bg-yellow-500 bg-opacity-80 rounded-lg shadow-lg z-40 text-center">
          <p className="text-sm font-bold text-slate-900">ALERTA DE EVENTO!</p>
          {activeEvent.type === 'meteor_shower' && (
            <p className="text-xs text-slate-800">🌠 Chuva de Meteoros! 🌠</p>
          )}
          {/* Add more event types here */}
        </div>
      )}


      {/* Top HUD (Player Stats & Time) */}
      <div className={`absolute ${bossEnemy ? 'top-16 md:top-20' : (activeEvent ? 'top-16 md:top-20' : 'top-0')} left-0 right-0 p-3 sm:p-4 text-white z-30 pointer-events-none`}>
        <div className="container mx-auto max-w-screen-lg flex justify-between items-start gap-2 sm:gap-4">
          {/* Left Block: Player Health, Level, Entropic Buff */}
          <div className="bg-slate-800 bg-opacity-75 p-2 sm:p-3 rounded-lg shadow-xl flex-grow max-w-sm">
            <div className="mb-1.5">
              <div className="flex justify-between text-xs sm:text-sm mb-0.5">
                <span>HP: {Math.ceil(playerStats.currentHp)} / {playerStats.maxHp}</span>
                <span className="text-lime-400 font-semibold">Zé Faísca</span>
              </div>
              <div className="w-full h-3 sm:h-4 bg-slate-700 rounded overflow-hidden border border-slate-600">
                <div
                  className="h-full bg-red-500 transition-all duration-300 ease-out"
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
            </div>
            <div className="text-xs sm:text-sm text-center">
                <span>Nível Zé: {playerStats.level}</span>
            </div>
            {entropicBuffPercent > 0 && (
              <div className="text-xs sm:text-sm text-center mt-1 text-cyan-300">
                <span>💠 Dano Entrópico: +{entropicBuffPercent}% ({Math.ceil(playerStats.entropicBuffDuration / 1000)}s)</span>
              </div>
            )}
          </div>

          {/* Right Block: Time, Wave, Enemies Left */}
          <div className="bg-slate-800 bg-opacity-75 p-2 sm:p-3 rounded-lg shadow-xl text-center min-w-[120px]">
            <div className="text-xl sm:text-3xl font-bold text-yellow-400">{formatTime(gameTime)}</div>
            <div className="text-2xs sm:text-xs text-slate-400 mb-1">Tempo</div>
            <div className="text-lg sm:text-xl font-semibold text-purple-400">ONDA: {waveNumber}</div>
             {!bossEnemy && (
                <div className="text-xs sm:text-sm text-orange-300">
                  Inimigos: {Math.min(enemiesDefeatedInWave, enemiesRequiredInWave)} / {enemiesRequiredInWave}
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Bottom HUD for Owned Upgrades */}
      {ownedUpgradesToDisplay.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-30 pointer-events-none">
          <div className="container mx-auto max-w-screen-md">
            <div className="bg-slate-800 bg-opacity-75 p-1.5 sm:p-2 rounded-lg shadow-xl flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
              {ownedUpgradesToDisplay.map(upg => (
                <div 
                  key={upg.id} 
                  title={upg.name}
                  className="flex items-center p-1 rounded-md"
                  style={{ backgroundColor: `${upg.color}33`}} 
                >
                  <span className="text-sm sm:text-base mr-0.5 sm:mr-1">{upg.icon}</span>
                  <span className="text-2xs sm:text-xs font-semibold" style={{ color: upg.color }}>
                    Lv{upg.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hud;
