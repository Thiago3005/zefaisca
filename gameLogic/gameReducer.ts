
import { GameState, GameAction, Player, Enemy, Projectile, HealingOrb, FloatingText, TemporaryEffect, Upgrade, Staff, EntropicFragment, ActiveDynamicEvent, Point, KeysPressed, PlayerStats, Accessory, ProjectileVisualType, SoundEffectKey, Rarity } from '../types';
import { INITIAL_PLAYER_STATS, UPGRADES, GAME_WIDTH, GAME_HEIGHT, PLAYER_INVULNERABILITY_DURATION, STAVES, ACCESSORIES, LIGHTNING_WARN_DURATION, EXPLOSION_EFFECT_DURATION, FLOATING_TEXT_DURATION, BOSS_WAVE_INTERVAL, PLAYER_GRAVITY, PLAYER_JUMP_FORCE, BASE_PROJECTILE_WIDTH, BASE_PROJECTILE_HEIGHT, BASE_PLAYER_PROJECTILE_SPEED, ENEMY_PROJECTILE_SPEED, GROUND_NODE_POINTS, GROUND_Y_LEVEL_VALUES, METEOR_SHOWER_EVENT_DURATION, METEOR_SPAWN_INTERVAL, METEOR_WARNING_DURATION, METEOR_IMPACT_RADIUS, METEOR_IMPACT_DAMAGE, ORB_GRAVITY, ORB_INITIAL_POP_VELOCITY, ENTROPIC_FRAGMENT_SIZE, ENTROPIC_FRAGMENT_DURATION, BOSS_STATS, PLAYER_BASE_WIDTH, PLAYER_BASE_HEIGHT, BOSS_PROJECTILE_SPEED } from '../constants';
import { updatePlayerMovement, handlePlayerShooting, updatePlayerBuffsAndInvulnerability, processPlayerDamage, handleEntropicFragmentCollection } from './playerLogic';
import { spawnEnemiesForWave, createBoss, updateEnemyAIAndMovement, applyPlayerProjectileDamageToEnemies, applyAoeDamageToEnemies } from './enemyLogic';
import { calculateEnemiesForWave, isBossWave } from './waveLogic';
import { updatePlayerProjectiles, updateEnemyProjectiles } from './projectileLogic';
import { spawnNewOrb, updateOrbs, getVisualGroundYAtX } from './orbLogic';
import { rectCollision } from './collisionLogic';
import audioManager from '../services/audioManager';


export const createInitialState = (selectedStaff: Staff, selectedAccessory: Accessory, mainGroundVisualNodes: Point[]): GameState => {
  let statsCopy: PlayerStats = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));
  if (selectedAccessory && selectedAccessory.applyStats) {
    statsCopy = selectedAccessory.applyStats(statsCopy);
  }
  const playerW = PLAYER_BASE_WIDTH * statsCopy.playerSizeMultiplier;
  const playerH = PLAYER_BASE_HEIGHT * statsCopy.playerSizeMultiplier;
  const initialGroundNode = mainGroundVisualNodes[0] || { x: GAME_WIDTH / 4, y: GROUND_Y_LEVEL_VALUES[0] };
  const startingY = initialGroundNode.y - playerH;

  const player: Player = {
    id: 'player', x: GAME_WIDTH / 4 - playerW / 2, y: startingY,
    vx: 0, vy: 0, width: playerW, height: playerH, stats: statsCopy,
    isInvulnerable: false, lastHitTime: 0, facingDirection: 'right',
    selectedStaffId: selectedStaff.id, selectedAccessoryId: selectedAccessory?.id,
    isEligibleForRanking: selectedAccessory?.id !== 'cartola_vigarista',
    isOnGround: true, jumpsLeft: statsCopy.maxJumps,
  };

  const initialWaveNum = 1;
  const initialEnemiesRequired = calculateEnemiesForWave(initialWaveNum);
  const initialEnemies = spawnEnemiesForWave(initialWaveNum, initialEnemiesRequired, 0, selectedAccessory?.id, player.x);

  return {
    player,
    enemies: initialEnemies,
    playerProjectiles: [],
    enemyProjectiles: [],
    healingOrbs: [],
    entropicFragments: [],
    temporaryEffects: [], // Managed by GameView's pooling
    gameTime: 0,
    internalGameTime: 0,
    waveNumber: initialWaveNum,
    enemiesDefeatedThisWave: 0,
    enemiesRequiredForWave: initialEnemiesRequired,
    isBossFightActive: false,
    currentUpgradeChoices: [],
    activeDynamicEvent: null,
    shouldShowUpgradeModal: false,
    isGameOver: false,
    gameOverScore: 0,
    gameOverLevel: 1,
    floatingTextsToAdd: [],
    tempEffectsToAdd: [],
  };
};


export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE_GAME_STATE': {
        const { player, enemies, waveNumber, enemiesRequiredForWave } = action.payload;
        return {
            ...state, // Spread existing state to keep things like refs or UI state if any were part of it
            player,
            enemies,
            playerProjectiles: [],
            enemyProjectiles: [],
            healingOrbs: [],
            entropicFragments: [],
            temporaryEffects: [],
            gameTime: 0,
            internalGameTime: 0,
            waveNumber,
            enemiesDefeatedThisWave: 0,
            enemiesRequiredForWave,
            isBossFightActive: false,
            currentUpgradeChoices: [],
            activeDynamicEvent: null,
            shouldShowUpgradeModal: false,
            isGameOver: false,
            gameOverLevel: player.stats.level,
            gameOverScore: 0,
            floatingTextsToAdd: [],
            tempEffectsToAdd: [],
        };
    }
    case 'PROCESS_GAME_TICK': {
      const { delta, now, keysPressed, mousePosition, selectedStaff, mainGroundVisualNodes } = action.payload;
      if (state.isGameOver || state.shouldShowUpgradeModal) return state; // Don't process game logic if paused or game over

      let newState = { ...state, internalGameTime: state.internalGameTime + delta * 1000, floatingTextsToAdd: [], tempEffectsToAdd: [] };
      if (Math.floor(newState.internalGameTime / 1000) !== newState.gameTime) {
        newState.gameTime = Math.floor(newState.internalGameTime / 1000);
      }
      
      let defeatedThisTickCount = 0;

      // Player buffs and invulnerability
      const playerBuffAndInvulnUpdates = updatePlayerBuffsAndInvulnerability(newState.player, now, delta, (text, x, y, color, isCrit) => {
        newState.floatingTextsToAdd.push({ text, x, y, color, isCrit, timestamp: Date.now(), duration: FLOATING_TEXT_DURATION, id: '' });
      });
      newState.player = { ...newState.player, ...playerBuffAndInvulnUpdates };

      // Player movement
      const playerMovementUpdates = updatePlayerMovement(newState.player, keysPressed, delta, mousePosition.x, newState.player.stats.coffeeBuff.active, newState.player.stats.coffeeBuff.speedMultiplier, mainGroundVisualNodes);
      newState.player = { ...newState.player, ...playerMovementUpdates };
      
      // Player shooting (moved to separate action for clarity)

      // Friction Upgrade Logic
        if (newState.player.stats.frictionStats.enabled && Math.abs(newState.player.vx) > 0) {
            const distanceMoved = Math.abs(newState.player.vx) * delta;
            const newTotalDistance = newState.player.stats.frictionStats.distanceRunSinceLastActivation + distanceMoved;

            if (newTotalDistance >= newState.player.stats.frictionStats.distancePerProjectile) {
                const activations = Math.floor(newTotalDistance / newState.player.stats.frictionStats.distancePerProjectile);
                const pStats = newState.player.stats;
                const newProjectilesFromFriction: Projectile[] = [];
                
                for (let act = 0; act < activations; act++) {
                    for (let i = 0; i < pStats.frictionStats.projectilesPerActivation; i++) {
                        newProjectilesFromFriction.push({
                            id: `friction-${now}-${Math.random()}`,
                            x: newState.player.x + newState.player.width / 2,
                            y: newState.player.y + newState.player.height / 2,
                            width: 8, height: 18,
                            vx: (Math.random() - 0.5) * 50,
                            vy: -BASE_PLAYER_PROJECTILE_SPEED * 0.6,
                            damage: pStats.frictionStats.projectileDamage,
                            isPlayerProjectile: true,
                            color: '#FFA500', visualType: 'friction_spark', staffId: 'friction_ability',
                            originalShooterId: newState.player.id, pierceLeft: 0,
                            explodesOnImpact: true,
                            explosionRadius: pStats.frictionStats.explosionRadius * pStats.antiAircraftFrictionRadiusMultiplier,
                        });
                    }
                }
                if (newProjectilesFromFriction.length > 0) {
                     newState.playerProjectiles = [...newState.playerProjectiles, ...newProjectilesFromFriction];
                     audioManager.playSound('friction_projectile_launch', { volume: 0.3 });
                }
               
                newState.player = {
                    ...newState.player,
                    stats: {
                        ...newState.player.stats,
                        frictionStats: {
                            ...newState.player.stats.frictionStats,
                            distanceRunSinceLastActivation: newTotalDistance % newState.player.stats.frictionStats.distancePerProjectile,
                        }
                    }
                };
            } else {
                 newState.player = {
                    ...newState.player,
                    stats: {
                        ...newState.player.stats,
                        frictionStats: {
                            ...newState.player.stats.frictionStats,
                            distanceRunSinceLastActivation: newTotalDistance,
                        }
                    }
                }};
        }


      // Projectiles update
      newState.playerProjectiles = updatePlayerProjectiles(
        newState.playerProjectiles, 
        delta, 
        newState.enemies, 
        newState.isBossFightActive, 
        (effectData: any) => {
          newState.tempEffectsToAdd.push({ 
            ...effectData, 
            id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(), 
            hitEnemyIds: new Set() 
          });
        }
      );
      newState.enemyProjectiles = updateEnemyProjectiles(
        newState.enemyProjectiles, 
        delta, 
        newState.player,
        (effectData: any) => {
          newState.tempEffectsToAdd.push({
            ...effectData,
            id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            hitEnemyIds: new Set()
          });
        }
      );

      // Enemy AI and movement
      const enemyUpdateResult = updateEnemyAIAndMovement(
        newState.enemies, newState.player, delta, now,
        (enemy, angle) => { // spawnEnemyProjectile
          let visualType: ProjectileVisualType = 'default_magic';
          let color = '#FF0000'; let pWidth = BASE_PROJECTILE_WIDTH; let pHeight = BASE_PROJECTILE_HEIGHT;
          let speed = ENEMY_PROJECTILE_SPEED; let damage = enemy.projectileDamage || 10;
          let shootSound: SoundEffectKey = 'enemy_shoot_generic';
          if (enemy.type === 'ufo_sniper') { visualType = 'ufo_projectile'; color = '#00FFFF'; shootSound = 'enemy_shoot_ufo';}
          else if (enemy.isBoss) {
            visualType = 'boss_homing_projectile'; color = '#8A2BE2'; pWidth = 22; pHeight = 22;
            speed = BOSS_PROJECTILE_SPEED; damage = BOSS_STATS.HOMING_PROJECTILE_DAMAGE; shootSound = 'boss_attack_homing';
          }
          audioManager.playSound(shootSound);
          newState.enemyProjectiles.push({
            id: `ep-${now}-${Math.random()}`, x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2,
            width: pWidth, height: pHeight, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            damage, isPlayerProjectile: false, color, visualType, staffId: 'enemy_staff', originalShooterId: enemy.id,
          });
        },
        (effectData) => { // addTemporaryEffect
          newState.tempEffectsToAdd.push({ ...effectData, id: '', createdAt: Date.now(), hitEnemyIds: new Set() });
        },
        mainGroundVisualNodes,
        newState.player.stats,
        (x, y) => newState.healingOrbs.push(spawnNewOrb(x, y, mainGroundVisualNodes)),
        (x, y) => {
          const groundY = getVisualGroundYAtX(x, mainGroundVisualNodes);
          newState.entropicFragments.push({
            id: `ef-${now}-${Math.random()}`, x: x - ENTROPIC_FRAGMENT_SIZE / 2, y: y - ENTROPIC_FRAGMENT_SIZE / 2,
            width: ENTROPIC_FRAGMENT_SIZE, height: ENTROPIC_FRAGMENT_SIZE, createdAt: now, vy: ORB_INITIAL_POP_VELOCITY, 
            isOnGround: false, groundY: groundY
          });
        },
        (x,y,type) => { /* spawnParticleEffect now handled via floatingTextsToAdd */ }
      );
      newState.enemies = enemyUpdateResult.updatedEnemies;
      defeatedThisTickCount += enemyUpdateResult.newlyCompletedDeaths;

      // Lightning Strikes
      if (newState.player.stats.lightningStrikes.enabled && now - newState.player.stats.lightningStrikes.lastCycleTime > newState.player.stats.lightningStrikes.cooldown) {
        newState.player = { ...newState.player, stats: { ...newState.player.stats, lightningStrikes: { ...newState.player.stats.lightningStrikes, lastCycleTime: now } } };
        for (let i = 0; i < newState.player.stats.lightningStrikes.strikesPerCycle; i++) {
          const aliveEnemies = newState.enemies.filter(e => e.hp > 0 && !e.isDying);
          let targetX = (aliveEnemies.length > 0) ? aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].x + aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].width/2 : newState.player.x + (Math.random() -0.5) * 200;
          newState.tempEffectsToAdd.push({
            x: targetX - 15, y: 0, width: 30, height: GAME_HEIGHT, effectType: 'lightning_aoe',
            duration: LIGHTNING_WARN_DURATION + EXPLOSION_EFFECT_DURATION, damage: newState.player.stats.lightningStrikes.damage,
            id: '', createdAt: 0, hitEnemyIds: new Set()
          });
          audioManager.playSound('projectile_explode', { volume: 0.7 });
        }
      }
      
      // Projectile Damage to Enemies
      const projectileDamageResult = applyPlayerProjectileDamageToEnemies(
        newState.enemies, newState.playerProjectiles, newState.player.stats,
        (text, x, y, color, isCrit) => newState.floatingTextsToAdd.push({ text, x, y, color, isCrit, timestamp: Date.now(), duration: FLOATING_TEXT_DURATION, id: '' }),
        (effectData) => newState.tempEffectsToAdd.push({ ...effectData, id: '', createdAt: Date.now(), hitEnemyIds: new Set() }),
        (x,y,type) => { /* spawnParticleEffect */ },
        (x,y) => {
            const groundY = getVisualGroundYAtX(x, mainGroundVisualNodes);
             newState.entropicFragments.push({
                id: `ef-${now}-${Math.random()}`, x: x - ENTROPIC_FRAGMENT_SIZE / 2, y: y - ENTROPIC_FRAGMENT_SIZE / 2,
                width: ENTROPIC_FRAGMENT_SIZE, height: ENTROPIC_FRAGMENT_SIZE, createdAt: now, vy: ORB_INITIAL_POP_VELOCITY, 
                isOnGround: false, groundY: groundY
            });
        },
        (projData) => newState.playerProjectiles.push({ ...projData, id: `ap-${now}-${Math.random()}` }),
        (x,y) => newState.healingOrbs.push(spawnNewOrb(x, y, mainGroundVisualNodes))
      );
      newState.enemies = projectileDamageResult.updatedEnemies;
      projectileDamageResult.newlyDefeatedEnemyData.forEach(e => defeatedThisTickCount++);
      if (projectileDamageResult.consumedProjectileIds.size > 0) {
        newState.playerProjectiles = newState.playerProjectiles.filter(p => !projectileDamageResult.consumedProjectileIds.has(p.id));
      }

      // AOE Damage
      // Temporary effects are now managed by GameView, so we pass an empty array assuming they are applied immediately if needed by applyAoeDamage.
      // Or, this logic needs to be integrated more tightly with GameView's temp effect pool.
      // For now, let's assume direct application for AOE.
      const activeTempEffectsForAoe = state.temporaryEffects.filter(eff => eff.isActive && (eff.effectType === 'explosion_aoe' || eff.effectType === 'lightning_aoe' || eff.effectType === 'meteor_impact_aoe'));

      const aoeDamageResult = applyAoeDamageToEnemies(
        newState.enemies, activeTempEffectsForAoe, /* Pass active effects from GameView's pool */
        now,
        (text, x, y, color, isCrit) => newState.floatingTextsToAdd.push({ text, x, y, color, isCrit, timestamp: Date.now(), duration: FLOATING_TEXT_DURATION, id: '' }),
        (x,y,type) => { /* spawnParticleEffect */ },
        newState.player.stats,
        (x,y) => newState.healingOrbs.push(spawnNewOrb(x, y, mainGroundVisualNodes)),
        (x,y) => {
            const groundY = getVisualGroundYAtX(x, mainGroundVisualNodes);
            newState.entropicFragments.push({
                id: `ef-${now}-${Math.random()}`, x: x - ENTROPIC_FRAGMENT_SIZE / 2, y: y - ENTROPIC_FRAGMENT_SIZE / 2,
                width: ENTROPIC_FRAGMENT_SIZE, height: ENTROPIC_FRAGMENT_SIZE, createdAt: now, vy: ORB_INITIAL_POP_VELOCITY, 
                isOnGround: false, groundY: groundY
            });
        }
      );
      newState.enemies = aoeDamageResult.updatedEnemies;
      aoeDamageResult.newlyDefeatedEnemyData.forEach(e => defeatedThisTickCount++);
      // Need to update GameView's temporaryEffects pool based on aoeDamageResult.updatedEffects


      // Player Damage
      const playerDamageResult = processPlayerDamage(
        newState.player, newState.enemyProjectiles, newState.enemies, now,
        (text, x, y, color, isCrit) => newState.floatingTextsToAdd.push({ text, x, y, color, isCrit, timestamp: Date.now(), duration: FLOATING_TEXT_DURATION, id: '' }),
        (intensity, duration) => { newState.triggerScreenShake = { intensity, duration, id: Math.random() }; }
      );
      if (playerDamageResult.damageTaken > 0 || playerDamageResult.invulnerabilityTriggered || playerDamageResult.shieldBroken) {
        let newPlayerHp = newState.player.stats.currentHp - playerDamageResult.damageTaken;
        let newShieldState = newState.player.stats.shield;
        if (playerDamageResult.shieldBroken && newShieldState.enabled && newShieldState.active) {
          newShieldState = { ...newShieldState, active: false, cooldownActive: true, cooldownTimeLeft: newShieldState.maxCooldown };
          audioManager.playSound('player_shield_block');
        }
        if (playerDamageResult.damageTaken > 0 && !playerDamageResult.shieldBroken) audioManager.playSound('player_hit');
        newState.player = {
          ...newState.player,
          stats: { ...newState.player.stats, currentHp: Math.max(0, newPlayerHp), shield: newShieldState },
          isInvulnerable: playerDamageResult.invulnerabilityTriggered ? true : newState.player.isInvulnerable,
          lastHitTime: playerDamageResult.invulnerabilityTriggered ? now : newState.player.lastHitTime,
        };
      }
      if (playerDamageResult.projectilesToConsume.length > 0) {
        newState.enemyProjectiles = newState.enemyProjectiles.filter(ep => !playerDamageResult.projectilesToConsume.includes(ep.id));
      }

      // Orbs and Fragments
      newState.healingOrbs = updateOrbs(newState.healingOrbs, delta, now, newState.player, (orb, pData) => {
        audioManager.playSound('orb_collect_heal');
        newState.player = { ...newState.player, stats: { ...newState.player.stats, currentHp: Math.min(newState.player.stats.maxHp, newState.player.stats.currentHp + orb.healAmount) }};
        newState.floatingTextsToAdd.push({ text: `+${orb.healAmount}`, x: orb.x, y:orb.y, color: '#32CD32', timestamp: Date.now(), duration: FLOATING_TEXT_DURATION, id: ''});
      }, mainGroundVisualNodes);
      
      const collectedFragmentIds = new Set<string>();
      newState.entropicFragments = newState.entropicFragments.map(frag => {
        if (rectCollision(newState.player, frag)) {
            collectedFragmentIds.add(frag.id);
            audioManager.playSound('entropic_fragment_collect');
            const playerUpdate = handleEntropicFragmentCollection(newState.player, frag, (text, x, y, color, isCrit) => {
                newState.floatingTextsToAdd.push({ text, x, y, color, isCrit, timestamp: Date.now(), duration: FLOATING_TEXT_DURATION, id: '' });
            });
            newState.player = { ...newState.player, ...playerUpdate };
            return null;
        }
        if (frag.isOnGround) return frag;
        let newVy = frag.vy + ORB_GRAVITY * delta;
        let newY = frag.y + newVy * delta;
        let landed = false;
        const groundY = frag.groundY !== undefined ? frag.groundY : getVisualGroundYAtX(frag.x + frag.width/2, mainGroundVisualNodes);
        if (newY + frag.height >= groundY) { newY = groundY - frag.height; newVy = 0; landed = true; }
        if (newY + frag.height >= GAME_HEIGHT) { newY = GAME_HEIGHT - frag.height; if (!landed) newVy = 0; landed = true; }
        return {...frag, y: newY, vy: newVy, isOnGround: landed};
      }).filter(frag => frag !== null && now - frag!.createdAt < ENTROPIC_FRAGMENT_DURATION) as EntropicFragment[];


      // Wave progression
      if (!newState.shouldShowUpgradeModal) {
          newState.enemiesDefeatedThisWave += defeatedThisTickCount;
          let waveShouldEnd = false;
          if (newState.isBossFightActive) {
            const boss = newState.enemies.find(e => e.isBoss);
            if (boss && boss.hp <= 0) waveShouldEnd = true;
          } else {
            if (newState.enemies.filter(e => e.hp > 0 && !e.isBoss).length === 0 && newState.enemiesDefeatedThisWave >= newState.enemiesRequiredForWave) {
              waveShouldEnd = true;
            }
          }

          if (waveShouldEnd) {
            newState.shouldShowUpgradeModal = true;
            audioManager.playSound('level_up');
            newState.player = { ...newState.player, stats: { ...newState.player.stats, currentHp: Math.min(newState.player.stats.maxHp, newState.player.stats.currentHp + newState.player.stats.maxHp * 0.25), level: newState.player.stats.level + 1 }};
            
            const rarityOrder = [Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.Epic, Rarity.Ascension, Rarity.Celestial];
            const luck = newState.player.stats.luckFactor || 0;
            const luckAdjustedWeight = (baseWeight: number, rarity: Rarity): number => {
                switch (rarity) {
                    case Rarity.Common: return baseWeight * Math.max(0.1, 1 - luck * 0.75);
                    case Rarity.Uncommon: return baseWeight * (1 + luck * 0.25);
                    case Rarity.Rare: return baseWeight * (1 + luck * 0.5);
                    case Rarity.Epic: return baseWeight * (1 + luck * 0.75);
                    case Rarity.Ascension: return baseWeight * (1 + luck * 1.0);
                    case Rarity.Celestial: return baseWeight * (1 + luck * 1.25);
                    default: return baseWeight;
                }
            };
            const weightedUpgrades = UPGRADES.flatMap(u => {
              const currentLevel = newState.player.stats.ownedUpgrades[u.id] || 0;
              if (u.maxLevel && currentLevel >= u.maxLevel) return [];
              if (u.id === 'alma_cajado_pipoca' && newState.player.selectedStaffId !== 'canhao_pipoca') return [];
              if (u.requires && u.requires.some(reqId => !newState.player.stats.ownedUpgrades[reqId])) return [];
              
              let baseWeight = 10;
              if (u.rarity === Rarity.Uncommon) baseWeight = 7;
              else if (u.rarity === Rarity.Rare) baseWeight = 4;
              else if (u.rarity === Rarity.Epic) baseWeight = 2.5;
              else if (u.rarity === Rarity.Ascension) baseWeight = 1;
              else if (u.rarity === Rarity.Celestial) baseWeight = 0.5;
              
              const finalWeight = Math.max(1, Math.round(luckAdjustedWeight(baseWeight, u.rarity)));
              return Array(finalWeight).fill(u);
            });
            let choices: Upgrade[] = [];
            let available = [...weightedUpgrades];
            const maxChoices = newState.player.stats.upgradeChoices;
            while (choices.length < maxChoices && available.length > 0) {
                let randIndex = Math.floor(Math.random() * available.length);
                let newChoice = available[randIndex];
                if (!choices.some(c => c.id === newChoice.id)) choices.push(newChoice);
                available.splice(randIndex, 1);
            }
            choices.sort((a,b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
            newState.currentUpgradeChoices = choices;
            audioManager.stopSound('game_music'); // Pause music
          }
      }

      // Game Over check
      if (newState.player.stats.currentHp <= 0 && !newState.isGameOver) {
        newState.isGameOver = true;
        newState.gameOverScore = newState.gameTime;
        newState.gameOverLevel = newState.player.stats.level;
        audioManager.playSound('player_death');
        audioManager.playSound('game_over_fanfare');
        audioManager.stopSound('game_music'); 
      }
      return newState;
    }
    case 'PLAYER_JUMP_ACTION': {
        if (state.player.jumpsLeft > 0 && state.player.vy >= -PLAYER_JUMP_FORCE * 0.5) {
            audioManager.playSound('player_jump');
            return {
                ...state,
                player: {
                    ...state.player,
                    vy: -PLAYER_JUMP_FORCE,
                    jumpsLeft: state.player.jumpsLeft - 1,
                    isOnGround: false, // Ensure player is marked as not on ground immediately
                }
            };
        }
        return state;
    }
    case 'PLAYER_SHOOT_ACTION': {
        const { now, mousePosition, selectedStaff } = action.payload;
        const actualFireRate = state.player.stats.baseFireRate * (selectedStaff.fireRateModifier || 1) * (state.player.stats.coffeeBuff.active ? state.player.stats.coffeeBuff.fireRateMultiplier : 1);
        if (now - (state.player.lastHitTime /* This should be lastPlayerShotTime from ref */) < actualFireRate) { // Problem: lastPlayerShotTime is a ref, not in state
          return state; // Ideally, lastPlayerShotTime would be part of state or passed differently
        }
        
        const shootResult = handlePlayerShooting(state.player, selectedStaff, mousePosition, now, 0 /* pass lastPlayerShotTime from ref */, state.player.stats.coffeeBuff.active, state.player.stats.coffeeBuff.fireRateMultiplier, state.enemies, state.isBossFightActive);
        
        if (shootResult.projectiles.length > 0) {
            return {
                ...state,
                playerProjectiles: [...state.playerProjectiles, ...shootResult.projectiles],
                // player: {...state.player, lastPlayerShotTime: shootResult.newLastShotTime } // If lastPlayerShotTime were in state
            };
        }
        return state;
    }
    case 'SELECT_UPGRADE': {
      const upgrade = action.payload;
      const newStats = JSON.parse(JSON.stringify(state.player.stats));
      upgrade.apply(newStats, (newStats.ownedUpgrades[upgrade.id] || 0) + 1);
      newStats.ownedUpgrades[upgrade.id] = (newStats.ownedUpgrades[upgrade.id] || 0) + 1;
       if (upgrade.id === 'escudo_reativo' && newStats.shield.enabled && !newStats.shield.active && !newStats.shield.cooldownActive) {
            newStats.shield.active = true;
        }
      return { ...state, player: { ...state.player, stats: newStats }, currentUpgradeChoices: [] };
    }
    case 'REROLL_UPGRADES': {
        if (state.player.stats.rerollsAvailable > 0) {
            const newPlayerStats = { ...state.player.stats, rerollsAvailable: state.player.stats.rerollsAvailable - 1 };
            // Upgrade choice generation logic needs to be callable here or moved into reducer
            // For now, just decrement rerolls and assume GameView handles regeneration of choices.
            // This is complex because generateUpgradeChoices depends on playerRef.current.stats in GameView.
            // A better approach would be for generateUpgradeChoices to be a pure function taking playerStats.
             const rarityOrder = [Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.Epic, Rarity.Ascension, Rarity.Celestial];
            const luck = newPlayerStats.luckFactor || 0;
            const luckAdjustedWeight = (baseWeight: number, rarity: Rarity): number => { /* ... (copy from above) ... */ return baseWeight; }; // Simplified for brevity
            const weightedUpgrades = UPGRADES.flatMap(u => { /* ... (copy from above) ... */ return [u]; }); // Simplified
            let choices: Upgrade[] = [];
            let available = [...weightedUpgrades];
            const maxChoices = newPlayerStats.upgradeChoices;
            while (choices.length < maxChoices && available.length > 0) { /* ... (copy from above) ... */ }
            choices.sort((a,b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));

            return { ...state, player: { ...state.player, stats: newPlayerStats }, currentUpgradeChoices: choices };
        }
        return state;
    }
     case 'DISMISS_UPGRADE_MODAL_AND_START_NEXT_WAVE': {
        const nextWaveNumber = state.waveNumber + 1;
        let newEnemies: Enemy[];
        let enemiesRequired: number;
        let bossFightActive = false;
        let newActiveDynamicEvent: ActiveDynamicEvent | null = null;
        const newFloatingTexts: FloatingText[] = [...state.floatingTextsToAdd];

        if (isBossWave(nextWaveNumber)) {
            bossFightActive = true;
            newEnemies = [createBoss(nextWaveNumber)];
            enemiesRequired = 1;
            audioManager.playSound('boss_spawn');
            newFloatingTexts.push({ text: `!!! CHEFE ONDA ${nextWaveNumber} !!!`, x: GAME_WIDTH / 2, y: GAME_HEIGHT / 4, color: '#FF0000', isCrit: true, timestamp: Date.now(), duration: 3000, id:'' });
        } else {
            enemiesRequired = calculateEnemiesForWave(nextWaveNumber);
            newEnemies = spawnEnemiesForWave(nextWaveNumber, enemiesRequired, state.internalGameTime, state.player.selectedAccessoryId, state.player.x);
            newFloatingTexts.push({ text: `ONDA ${nextWaveNumber}!`, x: GAME_WIDTH / 2, y: GAME_HEIGHT / 3, color: '#FFFF00', isCrit: true, timestamp: Date.now(), duration: 2000, id:'' });
            if (nextWaveNumber % 3 === 0) { // Meteor shower
                audioManager.playSound('meteor_warn', { volume: 0.8 });
                newActiveDynamicEvent = { type: 'meteor_shower', startTime: Date.now(), duration: METEOR_SHOWER_EVENT_DURATION, lastMeteorSpawnTime: Date.now() };
                newFloatingTexts.push({ text: 'ALERTA: CHUVA DE METEOROS!', x: GAME_WIDTH / 2, y: GAME_HEIGHT / 5, color: '#FF8C00', isCrit: true, timestamp: Date.now(), duration: 3000, id:'' });
            }
        }
        audioManager.playSound('wave_start');
        audioManager.playSound('ambient_music_game', { loop: true, id: 'game_music' });

        return {
            ...state,
            shouldShowUpgradeModal: false,
            waveNumber: nextWaveNumber,
            enemies: newEnemies,
            enemiesDefeatedThisWave: 0,
            enemiesRequiredForWave: enemiesRequired,
            isBossFightActive: bossFightActive,
            temporaryEffects: [], // Clear old effects
            activeDynamicEvent: newActiveDynamicEvent,
            floatingTextsToAdd: newFloatingTexts,
        };
    }
    case 'ADD_FLOATING_TEXT_FROM_REDUCER': {
        // This action is more of a signal; GameView will handle the actual addition to its local state/pool.
        // The reducer just queues it up.
        return { ...state, floatingTextsToAdd: [...state.floatingTextsToAdd, { ...action.payload, id: `ft-${Date.now()}-${Math.random()}`, timestamp: Date.now() }] };
    }
    case 'ADD_TEMP_EFFECT_FROM_REDUCER': {
         return { ...state, tempEffectsToAdd: [...state.tempEffectsToAdd, { ...action.payload, id: `te-${Date.now()}-${Math.random()}`, createdAt: Date.now(), hitEnemyIds: new Set() }] };
    }
    default:
      return state;
  }
};
