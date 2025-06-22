
import { INITIAL_ENEMIES_PER_WAVE, ENEMIES_PER_WAVE_INCREMENT, BOSS_WAVE_INTERVAL } from '../constants';

export const isBossWave = (waveNumber: number): boolean => {
  return waveNumber % BOSS_WAVE_INTERVAL === 0;
};

export const calculateEnemiesForWave = (waveNumber: number): number => {
  if (isBossWave(waveNumber)) {
    return 1; // Boss wave always has 1 boss
  }

  if (waveNumber === 1) {
    return INITIAL_ENEMIES_PER_WAVE; // Typically 5
  }
  
  if (waveNumber === 2) {
    // Wave 2 = Wave 1 count + initial increment (e.g., 5 + 2 = 7)
    return INITIAL_ENEMIES_PER_WAVE + ENEMIES_PER_WAVE_INCREMENT; 
  }

  // For waveNumber >= 3
  // Starts with the count of wave 2, then adds 3 for each wave thereafter.
  // Example: Wave 3 = (Wave 2 count) + (3 - 2) * 3 = 7 + 1*3 = 10
  // Example: Wave 4 = (Wave 2 count) + (4 - 2) * 3 = 7 + 2*3 = 13
  const baseForWave2 = INITIAL_ENEMIES_PER_WAVE + ENEMIES_PER_WAVE_INCREMENT;
  const additionalWavesAfterWave2 = waveNumber - 2;
  const incrementForAdditionalWaves = additionalWavesAfterWave2 * 3;
  
  return baseForWave2 + incrementForAdditionalWaves;
};
