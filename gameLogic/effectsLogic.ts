

import { TemporaryEffect, Enemy } from '../types';
import { LIGHTNING_WARN_DURATION } from '../constants'; // Add other relevant constants if needed

export const createNewTemporaryEffect = (
    effectData: Omit<TemporaryEffect, 'id' | 'createdAt' | 'hitEnemyIds'>
): TemporaryEffect => {
    return {
        ...effectData,
        id: `eff-${Date.now()}-${Math.random()}`,
        createdAt: Date.now(),
        hitEnemyIds: new Set<string>()
    };
};

export const updateTemporaryEffects = (
    effects: TemporaryEffect[],
    now: number
): TemporaryEffect[] => {
    return effects.filter(effect => {
        if (now - effect.createdAt >= effect.duration) return false;
        // Potentially add logic here if effects need to update themselves (e.g., move, change shape)
        return true;
    });
};

// AOE damage application is now primarily handled in enemyLogic.ts's applyAoeDamageToEnemies
// This file is more for creating and filtering effects by duration.
// Damage dealing effects will have their 'damage' property read by enemyLogic.