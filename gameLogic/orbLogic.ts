
import { HealingOrb, Platform, Player, GrassBlade } from '../types';
import { HEALING_ORB_SIZE, HEALING_ORB_HEAL_AMOUNT, ORB_INITIAL_POP_VELOCITY, ORB_GRAVITY, HEALING_ORB_DURATION, GAME_HEIGHT, PLATFORMS, GROUND_Y_LEVEL_VALUES, GROUND_NODE_POINTS } from '../constants';
import { rectCollision } from './collisionLogic';

interface VisualNode { x: number; y: number; }

// Calculates the Y position on the visual ground at a given X coordinate.
// Uses linear interpolation between the defined ground nodes.
export const getVisualGroundYAtX = (targetX: number, groundNodes: VisualNode[]): number => {
  if (groundNodes.length === 0) return GAME_HEIGHT;

  let node1: VisualNode | null = null;
  let node2: VisualNode | null = null;

  for (let i = 0; i < groundNodes.length; i++) {
    if (groundNodes[i].x >= targetX) {
      node2 = groundNodes[i];
      node1 = i > 0 ? groundNodes[i-1] : groundNodes[i]; 
      break;
    }
  }
  
  if (!node2) { // TargetX is past the last node
    if (groundNodes.length > 0) return groundNodes[groundNodes.length - 1].y;
    return GAME_HEIGHT;
  }
  if (node1 === node2) return node1.y; // Exactly on a node or before first
  
  const t = (targetX - node1.x) / (node2.x - node1.x);
  if (node2.x === node1.x) return node1.y; 
  return node1.y + (node2.y - node1.y) * Math.max(0, Math.min(1, t)); 
};


export const spawnNewOrb = (x: number, y: number, groundNodes: VisualNode[]): HealingOrb => {
  const initialGroundY = getVisualGroundYAtX(x, groundNodes);
  return {
    id: `orb-${Date.now()}-${Math.random()}`,
    x: x - HEALING_ORB_SIZE / 2,
    y: y - HEALING_ORB_SIZE / 2,
    width: HEALING_ORB_SIZE,
    height: HEALING_ORB_SIZE,
    healAmount: HEALING_ORB_HEAL_AMOUNT,
    createdAt: Date.now(),
    vy: ORB_INITIAL_POP_VELOCITY,
    isOnGround: false,
    groundY: initialGroundY // Store the specific ground Y for this orb
  };
};

export const updateOrbs = (
  orbs: HealingOrb[],
  delta: number,
  now: number,
  player: Player,
  onOrbCollect: (orb: HealingOrb, player: Player) => void,
  groundNodes: VisualNode[]
): HealingOrb[] => {
  const updatedOrbs = orbs.map(orb => {
    if (orb.isOnGround) return orb;

    let newVy = orb.vy + ORB_GRAVITY * delta;
    let newY = orb.y + newVy * delta;
    let landed = false;

    // Use specific groundY for this orb, or recalculate if not set (should be set on spawn)
    const currentGroundY = orb.groundY !== undefined ? orb.groundY : getVisualGroundYAtX(orb.x + orb.width / 2, groundNodes);
    
    if (newY + orb.height >= currentGroundY) {
        newY = currentGroundY - orb.height;
        newVy = 0;
        landed = true;
    }

    // Fallback to absolute bottom of screen if something goes wrong
    if (newY + orb.height >= GAME_HEIGHT) {
      newY = GAME_HEIGHT - orb.height;
      if (!landed) newVy = 0; // Only reset vy if not already landed on visual ground
      landed = true;
    }
    return { ...orb, y: newY, vy: newVy, isOnGround: landed };
  }).filter(orb => now - orb.createdAt < HEALING_ORB_DURATION);

  const consumedOrbIds = new Set<string>();
  updatedOrbs.forEach(orb => {
    if (rectCollision(player, orb)) {
      consumedOrbIds.add(orb.id);
      onOrbCollect(orb, player);
    }
  });

  return updatedOrbs.filter(orb => !consumedOrbIds.has(orb.id));
};