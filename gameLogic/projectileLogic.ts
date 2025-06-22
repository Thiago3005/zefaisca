

import { Projectile, Enemy, Player, TemporaryEffect } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, BASE_PLAYER_PROJECTILE_SPEED, STAVES, BOSS_PROJECTILE_SPEED, PROJECTILE_TRAIL_PARTICLE_SIZE, PROJECTILE_TRAIL_PARTICLE_DURATION } from '../constants';

export const updatePlayerProjectiles = (
  projectiles: Projectile[],
  delta: number,
  enemies: Enemy[], // For homing
  isBossFightActive: boolean,
  addTempEffect: (effect: Omit<TemporaryEffect, 'id' | 'createdAt' | 'hitEnemyIds'>) => void
): Projectile[] => {
  return projectiles.map(proj => {
    let newVx = proj.vx || 0;
    let newVy = proj.vy || 0;
    const staffDetails = STAVES.find(s => s.id === proj.staffId);

    if (proj.homingTargetId) {
      const target = enemies.find(e => e.id === proj.homingTargetId);
      if (target && !(target.isStunnedUntil && Date.now() < target.isStunnedUntil) && (!target.isBoss || isBossFightActive)) {
        const angleToTarget = Math.atan2((target.y + target.height / 2) - proj.y, (target.x + target.width / 2) - proj.x);
        const currentSpeed = Math.sqrt(newVx ** 2 + newVy ** 2) || BASE_PLAYER_PROJECTILE_SPEED * (staffDetails?.projectileSpeedModifier || 1);
        const turnSpeed = 0.1; 
        newVx = newVx * (1 - turnSpeed) + Math.cos(angleToTarget) * currentSpeed * turnSpeed;
        newVy = newVy * (1 - turnSpeed) + Math.sin(angleToTarget) * currentSpeed * turnSpeed;
        const newSpeedMag = Math.sqrt(newVx ** 2 + newVy ** 2);
        if (newSpeedMag > 0) {
          newVx = (newVx / newSpeedMag) * currentSpeed;
          newVy = (newVy / newSpeedMag) * currentSpeed;
        }
      } else {
        proj.homingTargetId = undefined; // Target lost or invalid
      }
    }

    const nextX = proj.x + newVx * delta;
    const nextY = proj.y + newVy * delta;

    // Projectile trail
    if (Math.random() < 0.7) { // Adjust probability for trail density
      addTempEffect({
        x: proj.x, y: proj.y,
        width: PROJECTILE_TRAIL_PARTICLE_SIZE, height: PROJECTILE_TRAIL_PARTICLE_SIZE,
        effectType: 'projectile_trail_particle',
        duration: PROJECTILE_TRAIL_PARTICLE_DURATION,
        color: staffDetails?.projectileVisual === 'chinelo' || staffDetails?.projectileVisual === 'slipper' ? 'rgba(200,200,200,0.6)' : 'rgba(255,255,200,0.7)'
      });
    }

    return { ...proj, x: nextX, y: nextY, vx: newVx, vy: newVy };
  }).filter(p => p.x > -p.width - 100 && p.x < GAME_WIDTH + 100 && p.y > -p.height - 100 && p.y < GAME_HEIGHT + 100 && (p.pierceLeft === undefined || p.pierceLeft >= 0));
};

export const updateEnemyProjectiles = (
  projectiles: Projectile[],
  delta: number,
  player: Player
): Projectile[] => {
  return projectiles.map(proj => {
    let newVx = proj.vx || 0;
    let newVy = proj.vy || 0;

    if (proj.visualType === 'boss_homing_projectile') {
      const angleToPlayer = Math.atan2((player.y + player.height / 2) - proj.y, (player.x + player.width / 2) - proj.x);
      const currentSpeed = Math.sqrt(newVx ** 2 + newVy ** 2) || BOSS_PROJECTILE_SPEED;
      const turnSpeed = 0.03; // Slower turn for boss projectiles
      newVx = newVx * (1 - turnSpeed) + Math.cos(angleToPlayer) * currentSpeed * turnSpeed;
      newVy = newVy * (1 - turnSpeed) + Math.sin(angleToPlayer) * currentSpeed * turnSpeed;
      const newSpeedMag = Math.sqrt(newVx ** 2 + newVy ** 2);
      if (newSpeedMag > 0) {
        newVx = (newVx / newSpeedMag) * currentSpeed;
        newVy = (newVy / newSpeedMag) * currentSpeed;
      }
    }
    return { ...proj, x: proj.x + newVx * delta, y: proj.y + newVy * delta, vx: newVx, vy: newVy };
  }).filter(p => p.x > -p.width - 50 && p.x < GAME_WIDTH + 50 && p.y > -p.height - 50 && p.y < GAME_HEIGHT + 50);
};