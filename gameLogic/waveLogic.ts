
import { INITIAL_ENEMIES_PER_WAVE, ENEMIES_PER_WAVE_INCREMENT, BOSS_WAVE_INTERVAL } from '../constants';

export const calculateEnemiesForWave = (waveNumber: number): number => {
  if (waveNumber % BOSS_WAVE_INTERVAL === 0) {
    return 1; // Boss wave
  }
  return INITIAL_ENEMIES_PER_WAVE + Math.floor((waveNumber - 1) * ENEMIES_PER_WAVE_INCREMENT * (1 + (waveNumber - 1) * 0.05));
};

export const isBossWave = (waveNumber: number): boolean => {
  return waveNumber % BOSS_WAVE_INTERVAL === 0;
};