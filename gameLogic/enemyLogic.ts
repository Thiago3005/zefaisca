
import { Enemy, Player, Projectile, EnemyType, FloatingText, TemporaryEffect, TemporaryEffectType, PlayerStats, HealingOrb } from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT, ENEMY_DEFAULT_WIDTH, ENEMY_DEFAULT_HEIGHT, ENEMY_BASE_SPEED,
  ENEMY_BASE_HP, ENEMY_BASE_DAMAGE, ENEMY_BASE_PROJECTILE_DAMAGE, UFO_SNIPER_HP_BASE,
  UFO_SNIPER_PROJECTILE_DAMAGE_BASE, UFO_SNIPER_SPEED, UFO_SNIPER_SHOOT_COOLDOWN, UFO_SNIPER_TARGET_X_UPDATE_COOLDOWN,
  BASE_PROJECTILE_WIDTH, BASE_PROJECTILE_HEIGHT, ENEMY_PROJECTILE_SPEED, BOSS_STATS, BOSS_ATTACK_PATTERN_CONFIG,
  TARGET_FALL_Y_ON_SCREEN, ENEMY_FALL_IN_SPEED, BOSS_WAVE_INTERVAL, EXPLOSION_EFFECT_DURATION,
  ENEMY_VERTICAL_BOB_SPEED, ENEMY_VERTICAL_BOB_RANGE, ENEMY_VERTICAL_BOB_COOLDOWN_MIN, ENEMY_VERTICAL_BOB_COOLDOWN_MAX,
  ENEMY_ABSOLUTE_TARGET_X_UPDATE_MIN_COOLDOWN, ENEMY_ABSOLUTE_TARGET_X_UPDATE_MAX_COOLDOWN, ENEMY_HORIZONTAL_SPREAD_RANGE,
  ENEMY_BOBBING_CENTER_Y_UPDATE_MIN_COOLDOWN, ENEMY_BOBBING_CENTER_Y_UPDATE_MAX_COOLDOWN,
  ENEMY_BOBBING_CENTER_Y_SHIFT_AMOUNT, ENEMY_MIN_Y_TARGET_AREA, ENEMY_MAX_Y_TARGET_AREA,
  GHOST_MIN_SEPARATION_DISTANCE, GHOST_SCATTER_STRENGTH, GHOST_SCATTER_COOLDOWN,
  GHOST_PLAYER_ORBIT_RADIUS_MIN, GHOST_PLAYER_ORBIT_RADIUS_MAX, GHOST_PLAYER_TARGET_UPDATE_COOLDOWN,
  ALIEN_SWARMER_SHOOT_COOLDOWN, ALIEN_SWARMER_PROJECTILE_DAMAGE,
  SLIME_ANIMATION_CONFIG, SLIME_DISPLAY_WIDTH, SLIME_DISPLAY_HEIGHT, SLIME_SPRITE_NATIVE_WIDTH, SLIME_SPRITE_NATIVE_HEIGHT, PLAYER_GRAVITY,
  SOMBRA_OFUSCANTE_HP_BASE, SOMBRA_OFUSCANTE_SPEED, SOMBRA_OFUSCANTE_ABILITY_COOLDOWN, SOMBRA_OFUSCANTE_VISION_OBSCURE_DURATION, SOMBRA_OFUSCANTE_VISION_OBSCURE_RADIUS, SOMBRA_OFUSCANTE_WIDTH, SOMBRA_OFUSCANTE_HEIGHT,
  TECELAO_GRAVITACIONAL_HP_BASE, TECELAO_GRAVITACIONAL_SPEED, TECELAO_GRAVITACIONAL_ABILITY_COOLDOWN, TECELAO_GRAVITACIONAL_WELL_DURATION, TECELAO_GRAVITACIONAL_WELL_RADIUS, TECELAO_GRAVITACIONAL_WELL_PULL_FORCE, TECELAO_GRAVITACIONAL_WIDTH, TECELAO_GRAVITACIONAL_HEIGHT,
  SENTINELA_REPARADORA_HP_BASE, SENTINELA_REPARADORA_SPEED, SENTINELA_REPARADORA_HEAL_RANGE, SENTINELA_REPARADORA_HEAL_PULSE_INTERVAL, SENTINELA_REPARADORA_HEAL_AMOUNT, SENTINELA_REPARADORA_BEAM_DURATION, SENTINELA_REPARADORA_WIDTH, SENTINELA_REPARADORA_HEIGHT,
  ENTROPIC_FRAGMENT_DROP_CHANCE, STAVES, BASE_PLAYER_PROJECTILE_SPEED,
  PIPOCA_SOUL_FRAGMENT_COUNT, PIPOCA_SOUL_FRAGMENT_DAMAGE_MULTIPLIER, PIPOCA_SOUL_FRAGMENT_SPEED_MULTIPLIER, PIPOCA_SOUL_FRAGMENT_SIZE
} from '../constants';
import { rectCollision } from './collisionLogic';
import { getVisualGroundYAtX } from './orbLogic';
import audioManager from '../services/audioManager';

interface VisualNode { x: number; y: number; }


export const spawnEnemiesForWave = (
  currentWave: number,
  numEnemies: number,
  internalGameTime: number,
  playerAccessoryId: string | undefined,
  currentPlayerX: number
): Enemy[] => {
  const newEnemies: Enemy[] = [];
  const hasChiliAccessory = playerAccessoryId === 'pimenta_cosmica';
  const difficultyMultiplier = 1 + (internalGameTime / 1000 / 60 / 2) + (currentWave / 10) * (hasChiliAccessory ? 1.15 : 1);

  for (let i = 0; i < numEnemies; i++) {
    const spawnX = Math.random() * (GAME_WIDTH - ENEMY_DEFAULT_WIDTH);
    const spawnY = -ENEMY_DEFAULT_HEIGHT - Math.random() * 50;

    let enemyType: EnemyType = 'slime'; // Default
    const typeRoll = Math.random();
    let cumulativeProb = 0;

    // Helper to define probability slice for an enemy type
    const getTypeProbability = (baseProb: number, minWave: number, waveScaleFactor: number = 0.002, maxWaveProbIncrease: number = 0.05): number => {
        if (currentWave < minWave) return 0;
        // Increase probability based on wave, but cap the increase
        const waveIncrease = Math.min(maxWaveProbIncrease, (currentWave - minWave + 1) * waveScaleFactor);
        return baseProb + waveIncrease;
    };
    
    // Ordered from potentially rarer/higher-wave or more critical sky enemies first
    if (typeRoll < (cumulativeProb += getTypeProbability(0.08, 8))) { // Sentinela (Sky) up to ~13%
      enemyType = 'sentinela_reparadora';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.08, 7))) { // Tecelao (Sky) up to ~13%
      enemyType = 'tecelao_gravitacional';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.10, 5))) { // Sombra (Sky) up to ~15%
      enemyType = 'sombra_ofuscante';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.12, 6))) { // UFO (Sky) up to ~17%
      enemyType = 'ufo_sniper';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.15, 2, 0.003, 0.07))) { // Alien Swarmer (Sky) up to ~22%
      enemyType = 'alien_swarmer';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.10, 2, 0.002, 0.05))) { // Demon Shooter (Sky) up to ~15%
      enemyType = 'demon_shooter';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.15, 1, 0.003, 0.07))) { // Shooter (Sky) up to ~22%
      enemyType = 'shooter';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.04, 2, 0.001, 0.02))) { // Ghost Dasher (Sky - Reduced Freq) up to ~6%
      enemyType = 'ghost_dasher';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.08, 4))) { // Robot Brute (Ground/Large) up to ~13%
      enemyType = 'robot_brute';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.07, 3))) { // Poop Tank (Ground) up to ~12%
      enemyType = 'poop_tank';
    } else if (typeRoll < (cumulativeProb += getTypeProbability(0.05, 1, 0.001, 0.03))) { // Dasher (Ground/Fast) up to ~8%
      enemyType = 'dasher';
    }
    // 'slime' is the default if typeRoll >= cumulativeProb


    let enemySizeW = ENEMY_DEFAULT_WIDTH;
    let enemySizeH = ENEMY_DEFAULT_HEIGHT;
    let baseHpForType = ENEMY_BASE_HP;
    let baseDmgForType = ENEMY_BASE_DAMAGE;
    let baseProjDmgForType = ENEMY_BASE_PROJECTILE_DAMAGE;
    let baseSpeedForType = ENEMY_BASE_SPEED;
    let specificShootCooldown: number | undefined = undefined;
    let specificAbilityCooldown: number | undefined = undefined;


    if (enemyType === 'slime') {
        enemySizeW = SLIME_DISPLAY_WIDTH;
        enemySizeH = SLIME_DISPLAY_HEIGHT;
        baseHpForType = ENEMY_BASE_HP * 0.8;
        baseDmgForType = ENEMY_BASE_DAMAGE * 0.9;
        baseSpeedForType = ENEMY_BASE_SPEED * 0.9;
    } else {
        switch (enemyType) {
          case 'poop_tank': enemySizeW *= 1.3; enemySizeH *= 1.3; baseHpForType *= 2.5; baseSpeedForType *= 0.6; break;
          case 'robot_brute': enemySizeW *= 1.4; enemySizeH *= 1.4; baseHpForType *= 2; baseDmgForType *= 1.5; baseSpeedForType *= 0.7; break;
          case 'alien_swarmer':
            enemySizeW *= 0.7; enemySizeH *= 0.7; baseHpForType *= 0.6; baseSpeedForType *= 1.3;
            baseProjDmgForType = ALIEN_SWARMER_PROJECTILE_DAMAGE;
            specificShootCooldown = ALIEN_SWARMER_SHOOT_COOLDOWN;
            break;
          case 'ghost_dasher': baseSpeedForType *= 1.4; break;
          case 'ufo_sniper':
            baseHpForType = UFO_SNIPER_HP_BASE;
            baseProjDmgForType = UFO_SNIPER_PROJECTILE_DAMAGE_BASE;
            baseSpeedForType = UFO_SNIPER_SPEED;
            specificShootCooldown = UFO_SNIPER_SHOOT_COOLDOWN;
            break;
          case 'demon_shooter':
            specificShootCooldown = Math.max(800, (2500 - (internalGameTime / 1000) * 3) / Math.max(1, difficultyMultiplier * 0.7));
            baseSpeedForType *= 0.9; 
            break;
          case 'shooter': // Added configuration for shooter
            specificShootCooldown = 2500; // Base cooldown, e.g., 2.5 seconds
            // baseProjDmgForType uses ENEMY_BASE_PROJECTILE_DAMAGE by default, which is fine.
            break;
          case 'sombra_ofuscante':
            enemySizeW = SOMBRA_OFUSCANTE_WIDTH; enemySizeH = SOMBRA_OFUSCANTE_HEIGHT;
            baseHpForType = SOMBRA_OFUSCANTE_HP_BASE; baseSpeedForType = SOMBRA_OFUSCANTE_SPEED;
            specificAbilityCooldown = SOMBRA_OFUSCANTE_ABILITY_COOLDOWN;
            baseDmgForType *= 0.7; 
            break;
          case 'tecelao_gravitacional':
            enemySizeW = TECELAO_GRAVITACIONAL_WIDTH; enemySizeH = TECELAO_GRAVITACIONAL_HEIGHT;
            baseHpForType = TECELAO_GRAVITACIONAL_HP_BASE; baseSpeedForType = TECELAO_GRAVITACIONAL_SPEED;
            specificAbilityCooldown = TECELAO_GRAVITACIONAL_ABILITY_COOLDOWN;
             baseDmgForType *= 0.5; 
            break;
          case 'sentinela_reparadora':
            enemySizeW = SENTINELA_REPARADORA_WIDTH; enemySizeH = SENTINELA_REPARADORA_HEIGHT;
            baseHpForType = SENTINELA_REPARADORA_HP_BASE; baseSpeedForType = SENTINELA_REPARADORA_SPEED;
            baseDmgForType *= 0.3; 
            break;
        }
    }

    const enemyHP = Math.max(1, baseHpForType * difficultyMultiplier * (hasChiliAccessory ? 1.1 : 1));
    const enemyDmg = baseDmgForType * difficultyMultiplier * (hasChiliAccessory ? 1.1 : 1);
    const enemyFinalProjectileDamage = (enemyType !== 'slime' && enemyType !== 'sombra_ofuscante' && enemyType !== 'tecelao_gravitacional' && enemyType !== 'sentinela_reparadora')
      ? baseProjDmgForType * difficultyMultiplier * (hasChiliAccessory ? 1.1 : 1)
      : undefined;
    const enemySpeed = baseSpeedForType * Math.min(2.5, difficultyMultiplier * 0.9);
    const enemyEffectiveShootCooldown = specificShootCooldown
        ? Math.max(500, specificShootCooldown / Math.max(1, difficultyMultiplier * 0.8))
        : undefined;

    const isGroundedTypeForSpawn = ['slime', 'sombra_ofuscante', 'tecelao_gravitacional', 'sentinela_reparadora'].includes(enemyType);
    const isAerialPatroller = !isGroundedTypeForSpawn && !['ghost_dasher', 'ufo_sniper'].includes(enemyType);


    const newEnemy: Enemy = {
      id: `e-${Date.now()}-${i}`, x: spawnX, y: spawnY, width: enemySizeW, height: enemySizeH,
      hp: enemyHP, maxHp: enemyHP, damage: enemyDmg,
      projectileDamage: enemyFinalProjectileDamage,
      speed: enemySpeed,
      expValue: Math.round(baseHpForType / 10 + baseDmgForType / 2),
      type: enemyType,
      shootCooldown: enemyEffectiveShootCooldown,
      abilityCooldown: specificAbilityCooldown,
      lastShotTime: 0,
      lastAbilityTime: 0,
      alienSpitCooldown: enemyType === 'alien_swarmer' ? ALIEN_SWARMER_SHOOT_COOLDOWN : undefined,
      lastAlienSpitTime: enemyType === 'alien_swarmer' ? 0 : undefined,

      targetY: enemyType === 'ufo_sniper' ? 60 + Math.random() * 80 : undefined,
      ufoVerticalDriftDirection: enemyType === 'ufo_sniper' ? (Math.random() < 0.5 ? 1 : -1) : undefined,

      absoluteTargetX: isAerialPatroller ? currentPlayerX + (Math.random() - 0.5) * ENEMY_HORIZONTAL_SPREAD_RANGE : undefined,
      lastAbsoluteTargetXUpdateTime: isAerialPatroller ? internalGameTime : undefined,
      absoluteTargetXUpdateCooldown: isAerialPatroller ? ENEMY_ABSOLUTE_TARGET_X_UPDATE_MIN_COOLDOWN + Math.random() * (ENEMY_ABSOLUTE_TARGET_X_UPDATE_MAX_COOLDOWN - ENEMY_ABSOLUTE_TARGET_X_UPDATE_MIN_COOLDOWN) : undefined,

      verticalBobDirection: isAerialPatroller ? (Math.random() < 0.5 ? 1 : -1) : undefined,
      lastVerticalBobTime: isAerialPatroller ? internalGameTime : undefined,
      verticalBobCooldown: isAerialPatroller ? ENEMY_VERTICAL_BOB_COOLDOWN_MIN + Math.random() * (ENEMY_VERTICAL_BOB_COOLDOWN_MAX - ENEMY_VERTICAL_BOB_COOLDOWN_MIN) : undefined,

      currentBobbingCenterY: isAerialPatroller ? TARGET_FALL_Y_ON_SCREEN + Math.random() * 50 - 25 : undefined,
      lastBobbingCenterYUpdateTime: isAerialPatroller ? internalGameTime : undefined,
      bobbingCenterYUpdateCooldown: isAerialPatroller ? ENEMY_BOBBING_CENTER_Y_UPDATE_MIN_COOLDOWN + Math.random() * (ENEMY_BOBBING_CENTER_Y_UPDATE_MAX_COOLDOWN - ENEMY_BOBBING_CENTER_Y_UPDATE_MIN_COOLDOWN) : undefined,

      lastPlayerRelativeTargetUpdateTime: enemyType === 'ghost_dasher' ? 0 : undefined,
      isKiting: false, 

      animationState: enemyType === 'slime' ? 'idle' : undefined,
      currentFrame: enemyType === 'slime' ? 0 : undefined,
      lastFrameUpdateTime: enemyType === 'slime' ? internalGameTime : undefined,
      facingDirection: enemyType === 'slime' ? (Math.random() < 0.5 ? 'left' : 'right') : undefined,
      spriteSheetUrl: enemyType === 'slime' ? SLIME_ANIMATION_CONFIG.idle.spriteSheetUrl : undefined,
      spriteFrameWidth: enemyType === 'slime' ? SLIME_SPRITE_NATIVE_WIDTH : undefined,
      spriteFrameHeight: enemyType === 'slime' ? SLIME_SPRITE_NATIVE_HEIGHT : undefined,
      spriteTotalColumns: enemyType === 'slime' ? SLIME_ANIMATION_CONFIG.idle.totalColumns : undefined,
      animationLoops: enemyType === 'slime' ? SLIME_ANIMATION_CONFIG.idle.loops : undefined,
      deathAnimationDuration: enemyType === 'slime' ? SLIME_ANIMATION_CONFIG.die.frames * SLIME_ANIMATION_CONFIG.die.frameRate : undefined,
      isDying: false,
    };
    newEnemies.push(newEnemy);
  }
  return newEnemies;
};

export const createBoss = (waveNumber: number): Enemy => {
    const bossHp = BOSS_STATS.HP_BASE + BOSS_STATS.HP_SCALING_PER_WAVE_INTERVAL * Math.floor(waveNumber / BOSS_WAVE_INTERVAL);
    return {
        id: `boss-${Date.now()}`,
        x: GAME_WIDTH / 2 - BOSS_STATS.WIDTH / 2, y: -BOSS_STATS.HEIGHT - 20,
        width: BOSS_STATS.WIDTH, height: BOSS_STATS.HEIGHT,
        hp: bossHp, maxHp: bossHp,
        damage: BOSS_STATS.CONTACT_DAMAGE_BASE, speed: BOSS_STATS.SPEED,
        expValue: 500 + waveNumber * 10,
        type: 'boss_celestial_guardian', isBoss: true,
        attackPattern: 'idle', lastPatternChangeTime: Date.now(), patternCooldown: 2000,
        targetY: 50,
    };
};

export const updateEnemyAIAndMovement = (
  currentEnemies: Enemy[],
  player: Player,
  delta: number,
  now: number,
  spawnEnemyProjectile: (enemy: Enemy, angle: number) => void,
  addTemporaryEffect: (effect: Omit<TemporaryEffect, 'id' | 'createdAt' | 'hitEnemyIds'>) => void,
  mainGroundVisualNodes: VisualNode[],
  playerStats: PlayerStats,
  spawnOrbCallback: (x: number, y: number) => void,
  spawnEntropicFragmentCallback: (x: number, y: number) => void,
  spawnParticleEffectCallback: (x: number, y: number, type: 'enemy_death' | 'projectile_impact') => void
): { updatedEnemies: Enemy[], newlyCompletedDeaths: number } => {
  let newlyCompletedDeaths = 0; // This will now primarily track when slime animation *actually* finishes for removal.
  let mutableEnemiesList = [...currentEnemies];

  const processedEnemies = mutableEnemiesList.map(enemy => {
    let currentEnemyState = {...enemy};

    // Slime death animation initiation is now primarily handled in damage application functions.
    // This part ensures the animation progresses and the slime is eventually marked for removal.
    if (currentEnemyState.type === 'slime' && currentEnemyState.isDying) {
        if (currentEnemyState.hp === -1) { // Already fully processed post-death animation
            return currentEnemyState;
        }

        const isOffScreen = currentEnemyState.x + currentEnemyState.width < 0 || currentEnemyState.x > GAME_WIDTH ||
                            currentEnemyState.y + currentEnemyState.height < 0 || currentEnemyState.y > GAME_HEIGHT;

        if (isOffScreen && currentEnemyState.hp !== -1) { // If it somehow got offscreen during death animation before completion
            newlyCompletedDeaths++; // Count that this animation cycle is "done" for removal
            spawnParticleEffectCallback(currentEnemyState.x + currentEnemyState.width / 2, currentEnemyState.y + currentEnemyState.height / 2, 'enemy_death');
            if (Math.random() < playerStats.healOrbChance) { // Orb/Fragment drops are now tied to initial HP drop. This is a fallback or could be removed.
                spawnOrbCallback(currentEnemyState.x + currentEnemyState.width / 2, currentEnemyState.y + currentEnemyState.height / 2);
            }
            if (playerStats.ownedUpgrades['conversor_entropico'] && Math.random() < ENTROPIC_FRAGMENT_DROP_CHANCE && !currentEnemyState.isBoss) {
                spawnEntropicFragmentCallback(currentEnemyState.x + currentEnemyState.width / 2, currentEnemyState.y + currentEnemyState.height / 2);
            }
            audioManager.playSound('enemy_death_slime', { volume: 0.8 });
            currentEnemyState.hp = -1; // Mark as fully processed
        } else if (currentEnemyState.hp !== -1) {
            const animConfig = SLIME_ANIMATION_CONFIG.die;
            if (now - (currentEnemyState.lastFrameUpdateTime || 0) >= animConfig.frameRate) {
                currentEnemyState.currentFrame = (currentEnemyState.currentFrame || 0) + 1;
                currentEnemyState.lastFrameUpdateTime = now;
            }

            if ((currentEnemyState.currentFrame || 0) >= animConfig.frames) {
                newlyCompletedDeaths++; // Animation finished, mark for removal
                spawnParticleEffectCallback(currentEnemyState.x + currentEnemyState.width / 2, currentEnemyState.y + currentEnemyState.height / 2, 'enemy_death');
                // Orb/Fragment drops already handled when HP first reached 0.
                audioManager.playSound('enemy_death_slime', { volume: 0.8 });
                currentEnemyState.hp = -1; // Mark as fully processed
            }
        }
        return currentEnemyState;
    }

    if (currentEnemyState.hp <= 0) { // For non-slime enemies already marked dead, or slimes fully processed.
        return currentEnemyState; 
    }


    let currentSpeed = currentEnemyState.speed;
    if (currentEnemyState.isSlowed && now < currentEnemyState.isSlowed.until) currentSpeed *= (1 - currentEnemyState.isSlowed.multiplier);
    if (currentEnemyState.isStunnedUntil && now < currentEnemyState.isStunnedUntil) currentSpeed = 0;
    else if (currentEnemyState.isStunnedUntil && now >= currentEnemyState.isStunnedUntil) currentEnemyState.isStunnedUntil = undefined;

    let newX = currentEnemyState.x;
    let newY = currentEnemyState.y;
    let vx = 0;

    const visualGroundY = getVisualGroundYAtX(newX + currentEnemyState.width / 2, mainGroundVisualNodes);
    const enemyFeetAtGround = visualGroundY - currentEnemyState.height;

    const isGroundedType = ['slime', 'sombra_ofuscante', 'tecelao_gravitacional', 'sentinela_reparadora'].includes(currentEnemyState.type);
    const isAerialPatroller = !isGroundedType && !['ghost_dasher', 'ufo_sniper'].includes(currentEnemyState.type) && !currentEnemyState.isBoss;


    const intendedTargetY = currentEnemyState.isBoss ? (currentEnemyState.targetY || TARGET_FALL_Y_ON_SCREEN) :
                            currentEnemyState.type === 'ufo_sniper' ? (currentEnemyState.targetY || TARGET_FALL_Y_ON_SCREEN) :
                            isGroundedType ? enemyFeetAtGround :
                            (isAerialPatroller && currentEnemyState.currentBobbingCenterY !== undefined ? currentEnemyState.currentBobbingCenterY : enemyFeetAtGround);

    let hasLanded = newY >= intendedTargetY;

    const fallInTargetY = intendedTargetY;
    if (newY < fallInTargetY) {
        let fallSpeed = ENEMY_FALL_IN_SPEED;
        if (currentEnemyState.type === 'ufo_sniper') fallSpeed *= 0.7;
        else if (currentEnemyState.isBoss) fallSpeed *= 0.5;
        else if (currentEnemyState.type === 'slime' || isGroundedType) fallSpeed = PLAYER_GRAVITY * 0.5; 

        newY += fallSpeed * delta;
        if (newY >= fallInTargetY) {
            newY = fallInTargetY;
            hasLanded = true;
        }
    } else if (!hasLanded && !isGroundedType) { 
          newY = fallInTargetY;
          hasLanded = true;
    } else if (isGroundedType) { 
        newY = enemyFeetAtGround;
        hasLanded = true;
    }

    if (hasLanded && currentSpeed > 0) {
      if (isGroundedType) { 
        const directionToPlayer = Math.sign(player.x - newX);
        vx = directionToPlayer * currentSpeed;
        if (currentEnemyState.type === 'sentinela_reparadora' && currentEnemyState.healingTargetId) {
            const healingTarget = mutableEnemiesList.find(e => e.id === currentEnemyState.healingTargetId);
            if (healingTarget) {
                 const distToHealTarget = Math.hypot(healingTarget.x - newX, healingTarget.y - newY);
                 if (distToHealTarget > SENTINELA_REPARADORA_HEAL_RANGE * 0.7) { 
                     vx = Math.sign(healingTarget.x - newX) * currentSpeed;
                 } else if (distToHealTarget < SENTINELA_REPARADORA_HEAL_RANGE * 0.3) { 
                     vx = -Math.sign(healingTarget.x - newX) * currentSpeed * 0.5;
                 } else { 
                     vx = directionToPlayer * currentSpeed * 0.3; 
                 }
            }
        }
        newX += vx * delta;
        newY = enemyFeetAtGround; 

        if (currentEnemyState.type === 'slime') {
            currentEnemyState.facingDirection = vx > 0 ? 'right' : (vx < 0 ? 'left' : currentEnemyState.facingDirection);
            const newAnimState: 'idle' | 'run' = vx !== 0 ? 'run' : 'idle';
            if (currentEnemyState.animationState !== newAnimState) {
                currentEnemyState.animationState = newAnimState;
                const animConfig = SLIME_ANIMATION_CONFIG[newAnimState];
                currentEnemyState.spriteSheetUrl = animConfig.spriteSheetUrl;
                currentEnemyState.spriteTotalColumns = animConfig.totalColumns;
                currentEnemyState.animationLoops = animConfig.loops;
                currentEnemyState.currentFrame = 0;
                currentEnemyState.lastFrameUpdateTime = now;
            } else {
                const animConfig = SLIME_ANIMATION_CONFIG[currentEnemyState.animationState!];
                if (now - (currentEnemyState.lastFrameUpdateTime || 0) >= animConfig.frameRate) {
                    currentEnemyState.currentFrame = (currentEnemyState.currentFrame || 0) + 1;
                    if (currentEnemyState.currentFrame >= animConfig.frames) {
                        currentEnemyState.currentFrame = animConfig.loops ? 0 : animConfig.frames - 1;
                    }
                    currentEnemyState.lastFrameUpdateTime = now;
                }
            }
        }
      } else if (currentEnemyState.type === 'ghost_dasher') {
        let targetPlayerX = player.x + player.width / 2;
        let targetPlayerY = player.y + player.height / 2;
        if (now - (currentEnemyState.lastPlayerRelativeTargetUpdateTime || 0) > GHOST_PLAYER_TARGET_UPDATE_COOLDOWN) {
            const angleOffset = Math.random() * Math.PI * 2;
            const radius = GHOST_PLAYER_ORBIT_RADIUS_MIN + Math.random() * (GHOST_PLAYER_ORBIT_RADIUS_MAX - GHOST_PLAYER_ORBIT_RADIUS_MIN);
            currentEnemyState.playerRelativeTargetX = targetPlayerX + Math.cos(angleOffset) * radius;
            currentEnemyState.playerRelativeTargetY = targetPlayerY + Math.sin(angleOffset) * radius;
            currentEnemyState.lastPlayerRelativeTargetUpdateTime = now;
        }
        const effectiveTargetX = currentEnemyState.playerRelativeTargetX !== undefined ? currentEnemyState.playerRelativeTargetX : targetPlayerX;
        const effectiveTargetY = currentEnemyState.playerRelativeTargetY !== undefined ? currentEnemyState.playerRelativeTargetY : targetPlayerY;
        let moveAngle = Math.atan2(effectiveTargetY - (newY + currentEnemyState.height / 2), effectiveTargetX - (newX + currentEnemyState.width / 2));
        let scatterX = 0, scatterY = 0, isScattering = false;
        if (!currentEnemyState.isScatteringCooldownUntil || now > currentEnemyState.isScatteringCooldownUntil) {
            mutableEnemiesList.forEach(otherEnemy => {
                if (otherEnemy.id === currentEnemyState.id || otherEnemy.type !== 'ghost_dasher' || otherEnemy.hp <= 0) return;
                const distSq = (otherEnemy.x - newX)**2 + (otherEnemy.y - newY)**2;
                if (distSq < GHOST_MIN_SEPARATION_DISTANCE**2 && distSq > 0) {
                    const angleAway = Math.atan2(newY - otherEnemy.y, newX - otherEnemy.x);
                    scatterX += Math.cos(angleAway); scatterY += Math.sin(angleAway);
                    isScattering = true;
                }
            });
            if (isScattering) {
                const scatterMagnitude = Math.sqrt(scatterX**2 + scatterY**2);
                if (scatterMagnitude > 0) {
                    const scatterForce = GHOST_SCATTER_STRENGTH / scatterMagnitude;
                    newX += (scatterX / scatterMagnitude) * scatterForce * delta * currentSpeed * 0.1; 
                    newY += (scatterY / scatterMagnitude) * scatterForce * delta * currentSpeed * 0.1;
                    currentEnemyState.isScatteringCooldownUntil = now + GHOST_SCATTER_COOLDOWN;
                }
            }
        }
        if (!isScattering) { 
            newX += Math.cos(moveAngle) * currentSpeed * delta;
            newY += Math.sin(moveAngle) * currentSpeed * delta * 0.7; 
        }
        if (newY > enemyFeetAtGround) newY = enemyFeetAtGround; 
      } else if (currentEnemyState.type === 'ufo_sniper') {
        if (currentEnemyState.targetX === undefined || Math.abs(newX - currentEnemyState.targetX) < 10 || (now - (currentEnemyState.lastAbsoluteTargetXUpdateTime || 0)) > UFO_SNIPER_TARGET_X_UPDATE_COOLDOWN ) {
          currentEnemyState.targetX = player.x + player.width / 2 + (Math.random() - 0.5) * 100 - currentEnemyState.width / 2;
          currentEnemyState.targetX = Math.max(0, Math.min(GAME_WIDTH - currentEnemyState.width, currentEnemyState.targetX));
          currentEnemyState.lastAbsoluteTargetXUpdateTime = now;
        }
        const directionToTargetX = Math.sign(currentEnemyState.targetX - newX);
        newX += directionToTargetX * currentSpeed * delta;
        if (currentEnemyState.targetY) { 
            newY += (currentEnemyState.ufoVerticalDriftDirection || 1) * (currentSpeed * 0.25) * delta;
            const driftRange = 15;
            if (newY < currentEnemyState.targetY - driftRange || newY > currentEnemyState.targetY + driftRange) {
                currentEnemyState.ufoVerticalDriftDirection = ((currentEnemyState.ufoVerticalDriftDirection || 1) === 1 ? -1 : 1);
            }
            newY = Math.max(currentEnemyState.targetY - (driftRange + 2), Math.min(currentEnemyState.targetY + (driftRange + 2), newY));
        }
      } else if (currentEnemyState.isBoss) {
         if (currentEnemyState.targetX === undefined || Math.abs(newX - currentEnemyState.targetX) < 20) {
            currentEnemyState.targetX = player.x + player.width / 2 - currentEnemyState.width / 2 + (Math.random() * 200 - 100);
            currentEnemyState.targetX = Math.max(0, Math.min(GAME_WIDTH - currentEnemyState.width, currentEnemyState.targetX!));
        }
        const directionToTargetX = Math.sign(currentEnemyState.targetX - newX);
        newX += directionToTargetX * currentEnemyState.speed * delta;
      } else { 
        if (currentEnemyState.absoluteTargetX === undefined || (now - (currentEnemyState.lastAbsoluteTargetXUpdateTime || 0) > (currentEnemyState.absoluteTargetXUpdateCooldown || ENEMY_ABSOLUTE_TARGET_X_UPDATE_MIN_COOLDOWN))) {
            currentEnemyState.absoluteTargetX = player.x + player.width/2 + (Math.random() - 0.5) * ENEMY_HORIZONTAL_SPREAD_RANGE - currentEnemyState.width/2;
            currentEnemyState.absoluteTargetX = Math.max(0, Math.min(GAME_WIDTH - currentEnemyState.width, currentEnemyState.absoluteTargetX!));
            currentEnemyState.lastAbsoluteTargetXUpdateTime = now;
            currentEnemyState.absoluteTargetXUpdateCooldown = ENEMY_ABSOLUTE_TARGET_X_UPDATE_MIN_COOLDOWN + Math.random() * (ENEMY_ABSOLUTE_TARGET_X_UPDATE_MAX_COOLDOWN - ENEMY_ABSOLUTE_TARGET_X_UPDATE_MIN_COOLDOWN);
        }
        const directionToTargetX = Math.sign(currentEnemyState.absoluteTargetX! - (newX + currentEnemyState.width / 2));
        if (Math.abs(currentEnemyState.absoluteTargetX! - (newX + currentEnemyState.width / 2)) > 5) { 
            newX += directionToTargetX * currentSpeed * delta;
        }
        if (isAerialPatroller && currentEnemyState.currentBobbingCenterY !== undefined) { 
          if(now - (currentEnemyState.lastVerticalBobTime || 0) > (currentEnemyState.verticalBobCooldown || ENEMY_VERTICAL_BOB_COOLDOWN_MIN)) {
            currentEnemyState.verticalBobDirection = ((currentEnemyState.verticalBobDirection || 1) === 1 ? -1 : 1);
            currentEnemyState.lastVerticalBobTime = now;
            currentEnemyState.verticalBobCooldown = ENEMY_VERTICAL_BOB_COOLDOWN_MIN + Math.random() * (ENEMY_VERTICAL_BOB_COOLDOWN_MAX - ENEMY_VERTICAL_BOB_COOLDOWN_MIN);
          }
          newY += (currentEnemyState.verticalBobDirection || 1) * ENEMY_VERTICAL_BOB_SPEED * delta;
          newY = Math.max(currentEnemyState.currentBobbingCenterY - ENEMY_VERTICAL_BOB_RANGE, Math.min(currentEnemyState.currentBobbingCenterY + ENEMY_VERTICAL_BOB_RANGE, newY));
          if(now - (currentEnemyState.lastBobbingCenterYUpdateTime || 0) > (currentEnemyState.bobbingCenterYUpdateCooldown || ENEMY_BOBBING_CENTER_Y_UPDATE_MIN_COOLDOWN)) {
              currentEnemyState.currentBobbingCenterY += (Math.random() - 0.5) * ENEMY_BOBBING_CENTER_Y_SHIFT_AMOUNT;
              currentEnemyState.currentBobbingCenterY = Math.max(ENEMY_MIN_Y_TARGET_AREA, Math.min(ENEMY_MAX_Y_TARGET_AREA, currentEnemyState.currentBobbingCenterY));
              currentEnemyState.lastBobbingCenterYUpdateTime = now;
              currentEnemyState.bobbingCenterYUpdateCooldown = ENEMY_BOBBING_CENTER_Y_UPDATE_MIN_COOLDOWN + Math.random() * (ENEMY_BOBBING_CENTER_Y_UPDATE_MAX_COOLDOWN - ENEMY_BOBBING_CENTER_Y_UPDATE_MIN_COOLDOWN);
          }
        }
      }
    }

    newX = Math.max(0, Math.min(GAME_WIDTH - currentEnemyState.width, newX));
    newY = Math.max(0, Math.min(GAME_HEIGHT - currentEnemyState.height, newY));
    if (isGroundedType) {
        newY = Math.min(newY, enemyFeetAtGround); 
    }
    currentEnemyState.x = newX;
    currentEnemyState.y = newY;

    const canUseAbility = !(currentEnemyState.isStunnedUntil && now < currentEnemyState.isStunnedUntil) && !(currentEnemyState.isSilencedUntil && now < currentEnemyState.isSilencedUntil) && hasLanded;

    if (canUseAbility) {
        if (currentEnemyState.shootCooldown && currentEnemyState.type !== 'slime' && 
            now - (currentEnemyState.lastShotTime || 0) > currentEnemyState.shootCooldown) {
            if (['demon_shooter', 'ufo_sniper', 'alien_swarmer', 'shooter'].includes(currentEnemyState.type)) {
                currentEnemyState.lastShotTime = now;
                if (currentEnemyState.type === 'alien_swarmer') currentEnemyState.lastAlienSpitTime = now; 
                let angleToPlayer = Math.atan2(
                  (player.y + player.height / 2) - (newY + currentEnemyState.height / 2),
                  (player.x + player.width / 2) - (newX + currentEnemyState.width / 2)
                );
                spawnEnemyProjectile(currentEnemyState, angleToPlayer);
            }
        }

        if (currentEnemyState.abilityCooldown && now - (currentEnemyState.lastAbilityTime || 0) > currentEnemyState.abilityCooldown) {
            currentEnemyState.lastAbilityTime = now;
            if (currentEnemyState.type === 'sombra_ofuscante') {
                audioManager.playSound('sombra_obscure_cast');
                addTemporaryEffect({
                    x: currentEnemyState.x + currentEnemyState.width / 2 - SOMBRA_OFUSCANTE_VISION_OBSCURE_RADIUS,
                    y: currentEnemyState.y + currentEnemyState.height / 2 - SOMBRA_OFUSCANTE_VISION_OBSCURE_RADIUS,
                    width: SOMBRA_OFUSCANTE_VISION_OBSCURE_RADIUS * 2,
                    height: SOMBRA_OFUSCANTE_VISION_OBSCURE_RADIUS * 2,
                    effectType: 'vision_obscure_aoe',
                    duration: SOMBRA_OFUSCANTE_VISION_OBSCURE_DURATION,
                });
            } else if (currentEnemyState.type === 'tecelao_gravitacional') {
                 audioManager.playSound('tecelao_gravity_cast');
                 addTemporaryEffect({
                    x: currentEnemyState.x + currentEnemyState.width / 2 - TECELAO_GRAVITACIONAL_WELL_RADIUS,
                    y: currentEnemyState.y + currentEnemyState.height / 2 - TECELAO_GRAVITACIONAL_WELL_RADIUS,
                    width: TECELAO_GRAVITACIONAL_WELL_RADIUS * 2,
                    height: TECELAO_GRAVITACIONAL_WELL_RADIUS * 2,
                    effectType: 'gravity_well_aoe',
                    duration: TECELAO_GRAVITACIONAL_WELL_DURATION,
                    pullForce: TECELAO_GRAVITACIONAL_WELL_PULL_FORCE,
                });
            }
        }

        if (currentEnemyState.type === 'sentinela_reparadora') {
            if (!currentEnemyState.healingTargetId || now - (currentEnemyState.lastHealPulseTime || 0) > SENTINELA_REPARADORA_HEAL_PULSE_INTERVAL * 2) { 
                let bestTarget: Enemy | null = null;
                let lowestHpPercent = Infinity;
                mutableEnemiesList.forEach(potentialTarget => {
                    if (potentialTarget.id !== currentEnemyState.id && potentialTarget.hp > 0 && potentialTarget.hp < potentialTarget.maxHp && potentialTarget.type !== 'sentinela_reparadora') {
                        const distSq = (potentialTarget.x - currentEnemyState.x)**2 + (potentialTarget.y - currentEnemyState.y)**2;
                        if (distSq < SENTINELA_REPARADORA_HEAL_RANGE**2) {
                            const hpPercent = potentialTarget.hp / potentialTarget.maxHp;
                            if (hpPercent < lowestHpPercent) {
                                lowestHpPercent = hpPercent;
                                bestTarget = potentialTarget;
                            }
                        }
                    }
                });
                currentEnemyState.healingTargetId = bestTarget?.id;
            }

            if (currentEnemyState.healingTargetId) {
                const targetIndex = mutableEnemiesList.findIndex(e => e.id === currentEnemyState.healingTargetId);
                if (targetIndex !== -1) {
                    const targetEnemy = mutableEnemiesList[targetIndex];
                    const distSqToTarget = (targetEnemy.x - currentEnemyState.x)**2 + (targetEnemy.y - currentEnemyState.y)**2;
                    if (targetEnemy.hp > 0 && targetEnemy.hp < targetEnemy.maxHp && distSqToTarget < SENTINELA_REPARADORA_HEAL_RANGE**2) {
                        if (now - (currentEnemyState.lastHealPulseTime || 0) > SENTINELA_REPARADORA_HEAL_PULSE_INTERVAL) {
                            audioManager.playSound('sentinela_heal_cast');
                            const newHp = Math.min(targetEnemy.maxHp, targetEnemy.hp + SENTINELA_REPARADORA_HEAL_AMOUNT);
                            mutableEnemiesList[targetIndex] = { ...targetEnemy, hp: newHp };
                            currentEnemyState.lastHealPulseTime = now;
                            addTemporaryEffect({
                                effectType: 'healing_beam',
                                x: currentEnemyState.x + currentEnemyState.width / 2, 
                                y: currentEnemyState.y + currentEnemyState.height / 2, 
                                width: targetEnemy.x + targetEnemy.width / 2, 
                                height: targetEnemy.y + targetEnemy.height / 2, 
                                sourceId: currentEnemyState.id,
                                targetId: targetEnemy.id,
                                duration: SENTINELA_REPARADORA_BEAM_DURATION,
                                color: 'rgba(50, 255, 50, 0.5)'
                            });
                             audioManager.playSound('sentinela_heal_beam_loop', {id: `heal_beam_${currentEnemyState.id}`, volume: 0.3});
                             setTimeout(() => audioManager.stopSound(`heal_beam_${currentEnemyState.id}`), SENTINELA_REPARADORA_BEAM_DURATION - 50);

                        }
                    } else { 
                        currentEnemyState.healingTargetId = undefined; 
                         audioManager.stopSound(`heal_beam_${currentEnemyState.id}`);
                    }
                } else { 
                    currentEnemyState.healingTargetId = undefined; 
                     audioManager.stopSound(`heal_beam_${currentEnemyState.id}`);
                }
            } else { 
                 audioManager.stopSound(`heal_beam_${currentEnemyState.id}`);
            }
        }
    } else { 
         if (currentEnemyState.type === 'sentinela_reparadora') {
             audioManager.stopSound(`heal_beam_${currentEnemyState.id}`);
         }
    }

    let curseTickDamage = 0;
    if (currentEnemyState.isCursedUntil && now < currentEnemyState.isCursedUntil && currentEnemyState.curseDps && currentEnemyState.hp > 0) {
        curseTickDamage = currentEnemyState.curseDps * delta;
    } else if (currentEnemyState.isCursedUntil && now >= currentEnemyState.isCursedUntil) {
        currentEnemyState.isCursedUntil = undefined;
        currentEnemyState.curseDps = undefined;
    }
    currentEnemyState.hp -= curseTickDamage;

    return currentEnemyState;
  });

  return { updatedEnemies: processedEnemies.filter(e => e.hp !== -1), newlyCompletedDeaths };
};


export const applyPlayerProjectileDamageToEnemies = (
    enemies: Enemy[],
    playerProjectiles: Projectile[],
    playerStats: PlayerStats,
    addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void,
    addTemporaryEffect: (effect: Omit<TemporaryEffect, 'id'|'createdAt'|'hitEnemyIds'>) => void,
    spawnParticleEffect: (x: number, y: number, type: 'enemy_death' | 'projectile_impact') => void,
    spawnEntropicFragmentCallback: (x: number, y: number) => void,
    spawnAdditionalProjectile: (projectile: Omit<Projectile, 'id'>) => void,
    spawnOrbCallback: (x: number, y: number) => void 
): { updatedEnemies: Enemy[], consumedProjectileIds: Set<string>, newlyDefeatedEnemyData: Enemy[] } => {

    const consumedProjectileIds = new Set<string>();
    const damageMap = new Map<string, { totalDamage: number, critHits: number, originalData: Enemy, firstHitPos: {x: number, y: number}, projectileId: string }>();
    const newlyDefeatedEnemyData: Enemy[] = [];

    playerProjectiles.forEach(proj => {
        if (consumedProjectileIds.has(proj.id)) return;
        let currentPierceLeft = proj.pierceLeft ?? 0;
        let projectileConsumedForThisProjectileInstance = false;
        
        const sortedEnemies = [...enemies].filter(e => e.hp > 0 && !e.isDying)
            .sort((a, b) => Math.hypot(a.x - proj.x, a.y - proj.y) - Math.hypot(b.x - proj.x, b.y - proj.y));

        for (const enemy of sortedEnemies) {
            if (projectileConsumedForThisProjectileInstance && currentPierceLeft <=0) break; 
            if (rectCollision(proj, enemy)) {
                const isCrit = Math.random() < playerStats.critChance;
                const damageDealt = proj.damage * (isCrit ? playerStats.critMultiplier : 1);
                const currentEnemyDamage = damageMap.get(enemy.id) || { totalDamage: 0, critHits: 0, originalData: JSON.parse(JSON.stringify(enemy)) as Enemy, firstHitPos: {x: proj.x, y: proj.y}, projectileId: proj.id };
                currentEnemyDamage.totalDamage += damageDealt;
                if (isCrit) currentEnemyDamage.critHits++;
                if (!damageMap.has(enemy.id)) currentEnemyDamage.firstHitPos = {x: proj.x, y: proj.y};
                currentEnemyDamage.projectileId = proj.id; 
                damageMap.set(enemy.id, currentEnemyDamage);

                if (Math.random() < playerStats.ghostShotChance) {
                    addFloatingText('👻', proj.x, proj.y, '#E6E6FA');
                } else if (currentPierceLeft > 0) {
                    currentPierceLeft--;
                } else {
                    projectileConsumedForThisProjectileInstance = true;
                }

                if (proj.visualType === 'pipoca_kernel' && playerStats.activeStaffSoulEffect === 'pipoca_multiply' && (projectileConsumedForThisProjectileInstance || currentPierceLeft <=0)) {
                    for (let i = 0; i < PIPOCA_SOUL_FRAGMENT_COUNT; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = BASE_PLAYER_PROJECTILE_SPEED * PIPOCA_SOUL_FRAGMENT_SPEED_MULTIPLIER;
                        spawnAdditionalProjectile({
                            x: proj.x + proj.width / 2, y: proj.y + proj.height / 2,
                            width: PIPOCA_SOUL_FRAGMENT_SIZE, height: PIPOCA_SOUL_FRAGMENT_SIZE,
                            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                            damage: proj.damage * PIPOCA_SOUL_FRAGMENT_DAMAGE_MULTIPLIER,
                            isPlayerProjectile: true, color: '#FFD700',
                            visualType: 'pipoca_fragment', staffId: proj.staffId,
                            originalShooterId: playerStats.level.toString(), 
                            pierceLeft: 0, 
                            isPipocaSoulFragment: true,
                        });
                    }
                }

                if (projectileConsumedForThisProjectileInstance || currentPierceLeft <= 0) {
                    const staffDetails = STAVES.find(s => s.id === proj.staffId);
                    if (staffDetails?.explodesOnImpact && staffDetails.explosionRadius) {
                       audioManager.playSound('projectile_explode');
                       addTemporaryEffect({
                            x: proj.x - staffDetails.explosionRadius + proj.width / 2,
                            y: proj.y - staffDetails.explosionRadius + proj.height / 2,
                            width: staffDetails.explosionRadius * 2, height: staffDetails.explosionRadius * 2,
                            effectType: 'explosion_aoe', duration: EXPLOSION_EFFECT_DURATION, damage: proj.damage * 0.75,
                        });
                    }
                }
            }
        }
        if (projectileConsumedForThisProjectileInstance) consumedProjectileIds.add(proj.id);
    });

    const updatedEnemies = enemies.map(enemy => {
        if (!damageMap.has(enemy.id) || enemy.isDying) return enemy; // Don't process already dying enemies further for HP
        
        const { totalDamage, critHits, originalData, firstHitPos } = damageMap.get(enemy.id)!;
        
        // Only apply damage if enemy was alive before this damage batch
        if (enemy.hp <= 0) return enemy; 

        const newHp = enemy.hp - totalDamage;
        addFloatingText( Math.ceil(totalDamage).toString(), originalData.x + originalData.width / 2, originalData.y, critHits > 0 ? '#FFD700' : '#FFFFFF', critHits > 0 );
        spawnParticleEffect(firstHitPos.x, firstHitPos.y, 'projectile_impact');

        if (Math.floor(newHp) <= 0) { // Enemy defeated by this batch of projectiles
            newlyDefeatedEnemyData.push(originalData); // Add to defeated list for counting

            if (enemy.type === 'slime') {
                return {
                    ...enemy,
                    hp: 0, 
                    isDying: true,
                    animationState: 'die' as const,
                    currentFrame: 0,
                    timeOfDeath: Date.now(),
                    lastFrameUpdateTime: Date.now(),
                    spriteSheetUrl: SLIME_ANIMATION_CONFIG.die.spriteSheetUrl,
                    spriteTotalColumns: SLIME_ANIMATION_CONFIG.die.totalColumns,
                    animationLoops: SLIME_ANIMATION_CONFIG.die.loops,
                    speed: 0 
                };
            } else {
                spawnParticleEffect(originalData.x + originalData.width/2, originalData.y + originalData.height/2, 'enemy_death');
                audioManager.playSound(enemy.isBoss ? 'boss_death' : 'enemy_death_generic');
                if (playerStats.ownedUpgrades['conversor_entropico'] && Math.random() < ENTROPIC_FRAGMENT_DROP_CHANCE && !enemy.isBoss) {
                   spawnEntropicFragmentCallback(originalData.x + originalData.width / 2, originalData.y + originalData.height / 2);
                }
                if (!enemy.isBoss && Math.random() < playerStats.healOrbChance) {
                    spawnOrbCallback(originalData.x + originalData.width / 2, originalData.y + originalData.height / 2);
                }
                return { ...enemy, hp: 0 }; 
            }
        }
        return { ...enemy, hp: newHp };
    });

    return { updatedEnemies, consumedProjectileIds, newlyDefeatedEnemyData };
};


export const applyAoeDamageToEnemies = (
    enemies: Enemy[],
    temporaryEffects: TemporaryEffect[],
    now: number,
    addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void,
    spawnParticleEffect: (x: number, y: number, type: 'enemy_death' | 'projectile_impact') => void,
    playerStats: PlayerStats,
    spawnOrbCallback: (x: number, y: number) => void,
    spawnEntropicFragmentCallback: (x: number, y: number) => void
): { updatedEnemies: Enemy[], updatedEffects: TemporaryEffect[], newlyDefeatedEnemyData: Enemy[] } => {
    
    const damageMap = new Map<string, { totalDamage: number, originalData: Enemy }>();
    const newlyDefeatedEnemyData: Enemy[] = [];

    const effectsDealingDamageThisTick = temporaryEffects.filter(eff => 
        (eff.effectType === 'explosion_aoe' || eff.effectType === 'lightning_aoe' || eff.effectType === 'meteor_impact_aoe') && eff.damage 
    );
    
    effectsDealingDamageThisTick.forEach(effect => {
        enemies.forEach(enemy => {
            if (enemy.isDying) return; // Don't damage already dying enemies
            if (enemy.hp <= 0 && enemy.type !== 'slime') return; // Already dead (non-slimes)

            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const effectCenterX = effect.x + effect.width / 2;
            const effectCenterY = effect.y + effect.height / 2;
            const distanceSq = (enemyCenterX - effectCenterX)**2 + (enemyCenterY - effectCenterY)**2;
            
            let hit = false;
            if (effect.effectType === 'explosion_aoe' || effect.effectType === 'lightning_aoe' || effect.effectType === 'meteor_impact_aoe') {
                if (distanceSq < (effect.width / 2)**2) {
                    hit = true;
                }
            }

            if (hit && effect.damage && (!effect.hitEnemyIds || !effect.hitEnemyIds.has(enemy.id))) {
                 if (enemy.hp <= 0 && enemy.type === 'slime' && !enemy.isDying) {
                    // This slime's HP is already 0 but it's not yet in 'isDying' state.
                    // This can happen if a projectile killed it and an AOE hits in the same tick.
                    // We should still mark it as hit by the AOE for effects but not double-count damage leading to negative HP.
                } else if (enemy.hp > 0) { // Only apply damage if HP > 0
                    const damageDealt = effect.damage;
                    const currentEnemyDamage = damageMap.get(enemy.id) || { totalDamage: 0, originalData: JSON.parse(JSON.stringify(enemy)) };
                    currentEnemyDamage.totalDamage += damageDealt;
                    damageMap.set(enemy.id, currentEnemyDamage);
                }
                if(effect.hitEnemyIds) effect.hitEnemyIds.add(enemy.id);
            }
        });
    });

    const updatedEnemies = enemies.map(enemy => {
        if (!damageMap.has(enemy.id) || enemy.isDying ) return enemy;
        if (enemy.hp <= 0 && enemy.type !== 'slime') return enemy; // Already dead non-slime

        const { totalDamage, originalData } = damageMap.get(enemy.id)!;
         if (enemy.hp <= 0 && enemy.type === 'slime') { // Slime HP is 0, but not dying yet - skip damage, but can be set to dying
            if (Math.floor(totalDamage) > 0 && !enemy.isDying) { //If AOE damage is significant and it wasn't already dying
                // This case should be rare if projectile damage already set it to dying
                // but if an AOE is the first to "kill" it this tick
                newlyDefeatedEnemyData.push(originalData);
                 return { 
                    ...enemy, 
                    hp: 0, 
                    isDying: true, 
                    animationState: 'die' as const,
                    currentFrame: 0, 
                    timeOfDeath: now, 
                    lastFrameUpdateTime: now, 
                    spriteSheetUrl: SLIME_ANIMATION_CONFIG.die.spriteSheetUrl, 
                    spriteTotalColumns: SLIME_ANIMATION_CONFIG.die.totalColumns, 
                    animationLoops: SLIME_ANIMATION_CONFIG.die.loops, 
                    speed: 0 
                };
            }
            return enemy; // No HP change if already at 0
        }


        const newHp = enemy.hp - totalDamage;
        addFloatingText(Math.ceil(totalDamage).toString(), originalData.x + originalData.width / 2, originalData.y, '#FFA500'); 

        if (Math.floor(newHp) <= 0) { // Enemy defeated by this AOE
            newlyDefeatedEnemyData.push(originalData);

            if (enemy.type === 'slime') {
                return { 
                    ...enemy, 
                    hp: 0, 
                    isDying: true, 
                    animationState: 'die' as const,
                    currentFrame: 0, 
                    timeOfDeath: now, 
                    lastFrameUpdateTime: now, 
                    spriteSheetUrl: SLIME_ANIMATION_CONFIG.die.spriteSheetUrl, 
                    spriteTotalColumns: SLIME_ANIMATION_CONFIG.die.totalColumns, 
                    animationLoops: SLIME_ANIMATION_CONFIG.die.loops, 
                    speed: 0 
                };
            } else {
                spawnParticleEffect(originalData.x + originalData.width / 2, originalData.y + originalData.height / 2, 'enemy_death');
                audioManager.playSound(enemy.isBoss ? 'boss_death' : 'enemy_death_generic');
                 if (playerStats.ownedUpgrades['conversor_entropico'] && Math.random() < ENTROPIC_FRAGMENT_DROP_CHANCE && !enemy.isBoss) {
                   spawnEntropicFragmentCallback(originalData.x + originalData.width / 2, originalData.y + originalData.height / 2);
                }
                if (!enemy.isBoss && Math.random() < playerStats.healOrbChance) {
                    spawnOrbCallback(originalData.x + originalData.width / 2, originalData.y + originalData.height / 2);
                }
                return { ...enemy, hp: 0 };
            }
        }
        return { ...enemy, hp: newHp };
    });
    
    return { updatedEnemies, updatedEffects: temporaryEffects, newlyDefeatedEnemyData };
};
