import { Player, KeysPressed, Staff, Enemy, Projectile, FloatingText, Platform, EntropicFragment, SoundEffectKey } from '../types';
import {
  PLAYER_GRAVITY, PLAYER_JUMP_FORCE, GAME_WIDTH, GAME_HEIGHT, BASE_PLAYER_PROJECTILE_SPEED,
  PLAYER_INVULNERABILITY_DURATION, BASE_PROJECTILE_WIDTH, BASE_PROJECTILE_HEIGHT, STAVES, ENEMY_BASE_PROJECTILE_DAMAGE, PLATFORMS,
  ENTROPIC_FRAGMENT_BUFF_PER_FRAGMENT, ENTROPIC_FRAGMENT_BUFF_DURATION, MAX_ENTROPIC_FRAGMENTS_BUFF_STACKS
} from '../constants';
import { rectCollision } from './collisionLogic';
import { getVisualGroundYAtX } from './orbLogic'; 
import audioManager from '../services/audioManager';

interface VisualNode { x: number; y: number; }

export const updatePlayerMovement = (
  player: Player,
  keysPressed: KeysPressed,
  delta: number,
  mousePositionX: number,
  coffeeBuffActive: boolean,
  coffeeSpeedMultiplier: number,
  mainGroundVisualNodes: VisualNode[]
): Partial<Player> => {
  let newVx = 0; 
  let currentVy = player.vy; 
  let playedLandSound = false;

  const playerCurrentSpeed = player.stats.speed * (coffeeBuffActive ? coffeeSpeedMultiplier : 1);
  if (keysPressed['a'] || keysPressed['ArrowLeft']) newVx = -playerCurrentSpeed;
  if (keysPressed['d'] || keysPressed['ArrowRight']) newVx = playerCurrentSpeed;

  let finalNewX = player.x + newVx * delta;
  let onGroundThisFrame = false; 
  let currentJumpsLeft = player.jumpsLeft;

  // Jump logic moved to GameView keydown to correctly play sound once per press
  // if ((keysPressed['w'] || keysPressed['ArrowUp'] || keysPressed[' ']) && currentJumpsLeft > 0 && player.vy >= -150) { 
  //   currentVy = -PLAYER_JUMP_FORCE;
  //   currentJumpsLeft--;
  //   if(keysPressed['w']) keysPressed['w'] = false;
  //   if(keysPressed['ArrowUp']) keysPressed['ArrowUp'] = false;
  //   if(keysPressed[' ']) keysPressed[' '] = false;
  // } else {
  //   currentVy += PLAYER_GRAVITY * delta;
  // }
  
  // Handle jump initiated from GameView
  if (keysPressed['jump_action_pending']) { // A temporary flag set by GameView keydown
    if(currentJumpsLeft > 0 && player.vy >= -PLAYER_JUMP_FORCE * 0.5) { // Ensure not already deeply falling or just jumped
        currentVy = -PLAYER_JUMP_FORCE;
        currentJumpsLeft--;
    }
    keysPressed['jump_action_pending'] = false; // Consume the action
  } else {
    currentVy += PLAYER_GRAVITY * delta;
  }


  let finalNewY = player.y + currentVy * delta; 
  const playerCenterXForGroundCheck = finalNewX + player.width / 2;
  const visualGroundSurfaceY = getVisualGroundYAtX(playerCenterXForGroundCheck, mainGroundVisualNodes);
  const playerFeetProposedY = finalNewY + player.height;
  const groundStickThreshold = 1.5; 

  if (currentVy >= 0 && 
      playerFeetProposedY >= visualGroundSurfaceY - groundStickThreshold && 
      (player.y + player.height) <= visualGroundSurfaceY + groundStickThreshold + player.height * 0.1 
     ) {
    if (!player.isOnGround) audioManager.playSound('player_land'); playedLandSound = true;
    finalNewY = visualGroundSurfaceY - player.height; 
    currentVy = 0; 
    onGroundThisFrame = true;
    currentJumpsLeft = player.stats.maxJumps;
  }

  const basePlatform = PLATFORMS.find(p => p.id === 'main_ground_collision_base');
  if (basePlatform) {
    const playerRect = { x: finalNewX, y: finalNewY, width: player.width, height: player.height };
    if (!onGroundThisFrame && currentVy >= 0 &&
        (player.y + player.height <= basePlatform.y + 1) && 
        (playerRect.y + playerRect.height >= basePlatform.y)      
       ) {
      if (!player.isOnGround && !playedLandSound) audioManager.playSound('player_land'); playedLandSound = true;
      finalNewY = basePlatform.y - player.height;
      currentVy = 0;
      onGroundThisFrame = true;
      currentJumpsLeft = player.stats.maxJumps;
    }
  }
  
  finalNewX = Math.max(0, Math.min(GAME_WIDTH - player.width, finalNewX));
  finalNewY = Math.max(0, finalNewY); 

  if (finalNewY + player.height > GAME_HEIGHT) {
      if (!player.isOnGround && !playedLandSound) audioManager.playSound('player_land');
      finalNewY = GAME_HEIGHT - player.height;
      if (currentVy > 0) currentVy = 0; 
      if (!onGroundThisFrame) { 
          onGroundThisFrame = true;
          currentJumpsLeft = player.stats.maxJumps;
      }
  }
  
  if (onGroundThisFrame && currentVy > 0) currentVy = 0;
  const calculatedFacingDirection: 'left' | 'right' = mousePositionX > finalNewX + player.width / 2 ? 'right' : 'left';

  return {
    x: finalNewX, y: finalNewY, vx: newVx, vy: currentVy, 
    isOnGround: onGroundThisFrame, jumpsLeft: currentJumpsLeft, facingDirection: calculatedFacingDirection,
  };
};

export const handlePlayerShooting = (
  player: Player,
  selectedStaff: Staff,
  mousePosition: { x: number; y: number },
  now: number,
  lastPlayerShotTime: number,
  coffeeBuffActive: boolean,
  coffeeFireRateMultiplier: number,
  enemies: Enemy[],
  isBossFightActive: boolean
): { projectiles: Projectile[], newLastShotTime: number } => {
  const actualFireRate = player.stats.baseFireRate * (selectedStaff.fireRateModifier || 1) * (coffeeBuffActive ? coffeeFireRateMultiplier : 1);
  if (now - lastPlayerShotTime < actualFireRate) {
    return { projectiles: [], newLastShotTime: lastPlayerShotTime };
  }
  const pStats = player.stats;
  
  let damageMultiplierFromEntropic = 1;
  if (pStats.entropicBuffDuration > 0 && pStats.collectedEntropicFragments > 0) {
    damageMultiplierFromEntropic = 1 + (pStats.collectedEntropicFragments * ENTROPIC_FRAGMENT_BUFF_PER_FRAGMENT);
  }
  const projectileBaseDamage = pStats.baseProjectileDamage * (selectedStaff.damageModifier || 1) * damageMultiplierFromEntropic;

  const projectileSpeed = BASE_PLAYER_PROJECTILE_SPEED * (selectedStaff.projectileSpeedModifier || 1);
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 3; 
  const baseAngle = Math.atan2(mousePosition.y - playerCenterY, mousePosition.x - playerCenterX);
  
  let shootSoundKey: SoundEffectKey = 'player_shoot_magic';
  switch(selectedStaff.id) {
    case 'chinelo_mamae': shootSoundKey = 'player_shoot_chinelo'; break;
    case 'canhao_pipoca': shootSoundKey = 'player_shoot_pipoca'; break;
    case 'rodo_magico': shootSoundKey = 'player_shoot_soap'; break;
    case 'desentupidor_celestial': shootSoundKey = 'player_shoot_plunger'; break;
    case 'pantufa_vovo': shootSoundKey = 'player_shoot_slipper'; break;
    case 'galinha_macumba': shootSoundKey = 'player_shoot_chicken'; break;
  }
  audioManager.playSound(shootSoundKey);

  const createBaseProjectile = (angle: number, damage: number, pSpeed: number, extraProps?: Partial<Projectile>): Projectile => ({
    id: `p-${now}-${Math.random()}`, x: playerCenterX, y: playerCenterY,
    width: BASE_PROJECTILE_WIDTH, height: BASE_PROJECTILE_HEIGHT,
    vx: Math.cos(angle) * pSpeed, vy: Math.sin(angle) * pSpeed,
    damage: damage, isPlayerProjectile: true, color: '#00FFFF', 
    visualType: selectedStaff.projectileVisual, staffId: selectedStaff.id, originalShooterId: player.id,
    pierceLeft: pStats.projectilePierceCount, ...extraProps,
  });

  const newProjectiles: Projectile[] = [];
  if (selectedStaff.shotgunPellets && selectedStaff.shotgunPellets > 0) {
    const spreadAngle = Math.PI / (12 + selectedStaff.shotgunPellets * 2); 
    for (let i = 0; i < selectedStaff.shotgunPellets; i++) {
      const pelletAngle = baseAngle - (spreadAngle * (selectedStaff.shotgunPellets - 1) / 2) + (i * spreadAngle);
      newProjectiles.push(createBaseProjectile(pelletAngle, projectileBaseDamage, projectileSpeed * (0.9 + Math.random() * 0.2)));
    }
  } else {
    let homingTargetId: string | undefined = undefined;
    if (selectedStaff.homing && enemies.length > 0) {
      let closestEnemy: Enemy | null = null;
      let minDistSq = Infinity;
      enemies.filter(e => e.hp > 0 && !(e.isStunnedUntil && now < e.isStunnedUntil) && (!e.isBoss || isBossFightActive))
        .forEach(enemy => {
          const distSq = (enemy.x - playerCenterX) ** 2 + (enemy.y - playerCenterY) ** 2;
          if (distSq < minDistSq) {
            minDistSq = distSq;
            closestEnemy = enemy;
          }
        });
      if (closestEnemy) homingTargetId = closestEnemy.id;
    }
    newProjectiles.push(createBaseProjectile(baseAngle, projectileBaseDamage, projectileSpeed, { homingTargetId, bouncesLeft: selectedStaff.bounces }));
  }
  return { projectiles: newProjectiles, newLastShotTime: now };
};

export const updatePlayerBuffsAndInvulnerability = (
  player: Player,
  now: number,
  delta: number,
  addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void
): Partial<Player> => {
  const newStats = { ...player.stats };
  let invulnerabilityExpired = false;

  if (newStats.coffeeBuff.active) {
    newStats.coffeeBuff.durationLeft -= delta * 1000;
    if (newStats.coffeeBuff.durationLeft <= 0) newStats.coffeeBuff.active = false;
  }

  if (newStats.entropicBuffDuration > 0) {
    newStats.entropicBuffDuration -= delta * 1000;
    if (newStats.entropicBuffDuration <= 0) {
      newStats.collectedEntropicFragments = 0; 
      addFloatingText('Bônus Entrópico Expirou!', player.x + player.width / 2, player.y - 30, '#80DEEA');
    }
  }

  if (newStats.shield.enabled) {
    if (newStats.shield.cooldownActive) {
      newStats.shield.cooldownTimeLeft -= delta * 1000;
      if (newStats.shield.cooldownTimeLeft <= 0) {
        newStats.shield.cooldownActive = false;
        newStats.shield.active = true;
        audioManager.playSound('player_shield_block', {volume: 0.5}); // Sound for shield ready
        addFloatingText('Escudo Pronto!', player.x + player.width / 2, player.y - 20, '#00FFFF');
      }
    } else if (!newStats.shield.active && !newStats.shield.cooldownActive) {
      // Shield was broken and is not cooling down, initiate cooldown
      newStats.shield.cooldownActive = true;
      newStats.shield.cooldownTimeLeft = newStats.shield.maxCooldown;
    }
  }
  
  if (player.isInvulnerable && (now - player.lastHitTime > PLAYER_INVULNERABILITY_DURATION)) {
    invulnerabilityExpired = true;
  }

  return {
    stats: newStats,
    isInvulnerable: invulnerabilityExpired ? false : player.isInvulnerable,
  };
};

export const processPlayerDamage = (
    player: Player,
    enemyProjectiles: Projectile[],
    enemies: Enemy[],
    now: number,
    addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void,
    triggerScreenShake: (intensity: number, duration: number) => void
): {
    damageTaken: number;
    invulnerabilityTriggered: boolean;
    projectilesToConsume: string[];
    shieldBroken: boolean; 
} => {
    let totalDamageThisTick = 0;
    let invulnerabilityTriggered = false;
    const projectilesToConsume: string[] = [];
    let shieldBrokenThisTick = false; 

    if (player.isInvulnerable) { 
      return { damageTaken: 0, invulnerabilityTriggered: false, projectilesToConsume: [], shieldBroken: false };
    }

    for (const proj of enemyProjectiles) {
        if (rectCollision(player, proj)) {
            projectilesToConsume.push(proj.id);
            triggerScreenShake(2, 150);
            
            if (Math.random() < player.stats.dodgeChance) {
                audioManager.playSound('player_dodge');
                addFloatingText('Esquivou!', player.x + player.width / 2, player.y - 10, '#00FFFF');
                continue;
            }
            if (player.stats.shield.enabled && player.stats.shield.active) {
                audioManager.playSound('player_shield_block');
                addFloatingText('Escudo!', player.x + player.width / 2, player.y - 10, '#00FFFF');
                shieldBrokenThisTick = true; 
                invulnerabilityTriggered = true; 
                continue; 
            }
            const damage = Math.max(0, (proj.damage || ENEMY_BASE_PROJECTILE_DAMAGE) * (1 - player.stats.defense));
            totalDamageThisTick += damage;
            invulnerabilityTriggered = true;
            // player_hit sound handled in GameView after this function returns
            addFloatingText(Math.ceil(damage).toString(), player.x + player.width / 2, player.y, '#FF4500');
            break; 
        }
    }

    if (!invulnerabilityTriggered) { 
        for (const enemy of enemies) {
            if (enemy.hp <= 0) continue;
            if (rectCollision(player, enemy)) {
                 triggerScreenShake(enemy.isBoss ? 5 : 3, enemy.isBoss ? 250 : 180);
                if (Math.random() < player.stats.dodgeChance) {
                    audioManager.playSound('player_dodge');
                    addFloatingText('Esquivou!', player.x + player.width / 2, player.y - 10, '#00FFFF');
                    continue; 
                }
                if (player.stats.shield.enabled && player.stats.shield.active) {
                    audioManager.playSound('player_shield_block');
                    addFloatingText('Escudo!', player.x + player.width / 2, player.y - 10, '#00FFFF');
                    shieldBrokenThisTick = true; 
                    invulnerabilityTriggered = true; 
                    break; 
                }
                const damage = Math.max(0, enemy.damage * (1 - player.stats.defense));
                totalDamageThisTick += damage;
                invulnerabilityTriggered = true;
                // player_hit sound handled in GameView
                addFloatingText(Math.ceil(damage).toString(), player.x + player.width / 2, player.y, '#FF4500');
                break; 
            }
        }
    }
    return { damageTaken: totalDamageThisTick, invulnerabilityTriggered, projectilesToConsume, shieldBroken: shieldBrokenThisTick };
};


export const handleEntropicFragmentCollection = (
    player: Player,
    fragment: EntropicFragment,
    addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void
): Partial<Player> => {
    const newStats = { ...player.stats };
    if (newStats.ownedUpgrades['conversor_entropico']) {
        newStats.collectedEntropicFragments = Math.min(MAX_ENTROPIC_FRAGMENTS_BUFF_STACKS, newStats.collectedEntropicFragments + 1);
        newStats.entropicBuffDuration = ENTROPIC_FRAGMENT_BUFF_DURATION;
        const currentBuffPercent = Math.round(newStats.collectedEntropicFragments * ENTROPIC_FRAGMENT_BUFF_PER_FRAGMENT * 100);
        addFloatingText(`💠+${currentBuffPercent}% Dano!`, player.x + player.width/2, player.y - 15, '#80DEEA', true);
        return { stats: newStats };
    }
    return {};
};