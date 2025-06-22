
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  GameStatus, Player, Enemy, Projectile,
  HealingOrb, Upgrade, FloatingText, Rarity, Staff, Accessory,
  TemporaryEffect, ProjectileVisualType, EnemyType, Platform, KeysPressed, PlayerStats,
  GrassBlade, TemporaryEffectType, EntropicFragment, ActiveDynamicEvent, SoundEffectKey
} from '../types';
import {
  INITIAL_PLAYER_STATS, UPGRADES, GAME_WIDTH, GAME_HEIGHT, PLAYER_BASE_WIDTH, PLAYER_BASE_HEIGHT,
  PLAYER_INVULNERABILITY_DURATION, STAVES, ACCESSORIES,
  LIGHTNING_WARN_DURATION, EXPLOSION_EFFECT_DURATION, FLOATING_TEXT_DURATION,
  BOSS_WAVE_INTERVAL, PLATFORMS, PLAYER_GRAVITY, PLAYER_JUMP_FORCE, 
  PLATFORM_BODY_COLOR, PLATFORM_TOP_COLOR, PLATFORM_STROKE_THICKNESS,
  BASE_PROJECTILE_WIDTH, BASE_PROJECTILE_HEIGHT, ENEMY_PROJECTILE_SPEED, BASE_PLAYER_PROJECTILE_SPEED,
  GROUND_NODE_POINTS, GROUND_Y_LEVEL_VALUES, GROUND_SMOOTHING_TENSION,
  ALIEN_SPIT_WIDTH, ALIEN_SPIT_HEIGHT, ALIEN_SWARMER_PROJECTILE_SPEED_MULTIPLIER, ALIEN_SWARMER_PROJECTILE_DAMAGE,
  ENEMY_DEATH_PARTICLE_DURATION, ENEMY_DEATH_PARTICLE_COUNT, ENEMY_DEATH_PARTICLE_SIZE, ENEMY_DEATH_PARTICLE_SPEED,
  PROJECTILE_IMPACT_PARTICLE_DURATION, PROJECTILE_IMPACT_PARTICLE_COUNT, PROJECTILE_IMPACT_PARTICLE_SIZE, PROJECTILE_IMPACT_PARTICLE_SPEED,
  GRASS_BLADE_COUNT_PER_SEGMENT, GRASS_BLADE_BASE_HEIGHT, GRASS_BLADE_HEIGHT_VARIATION, GRASS_BLADE_WIDTH,
  GRASS_COLORS, GRASS_BEND_ANGLE, GRASS_BEND_RECOVERY_SPEED, GRASS_PLAYER_INTERACTION_RADIUS, GRASS_WIND_STRENGTH, GRASS_WIND_SPEED, // Added missing grass constants
  SLIME_ANIMATION_CONFIG, ENTROPIC_FRAGMENT_SIZE, ENTROPIC_FRAGMENT_DURATION, ENTROPIC_FRAGMENT_DROP_CHANCE, ORB_GRAVITY, ORB_INITIAL_POP_VELOCITY,
  METEOR_SHOWER_EVENT_DURATION, METEOR_SPAWN_INTERVAL, METEOR_WARNING_DURATION, METEOR_IMPACT_RADIUS, METEOR_IMPACT_DAMAGE
} from '../constants';

import PlayerComponent from '../components/Player';
import EnemyComponent from '../components/Enemy';
import ProjectileComponent from '../components/Projectile';
import HealingOrbComponent from '../components/HealingOrb';
import Hud from '../components/Hud';
import UpgradeModal from '../components/UpgradeModal';
import StarfieldBackground from '../components/StarfieldBackground';
import ParallaxBackground from '../components/ParallaxBackground'; 
import audioManager from '../services/audioManager';

import { rectCollision } from '../gameLogic/collisionLogic';
import { spawnNewOrb, updateOrbs, getVisualGroundYAtX } from '../gameLogic/orbLogic'; 
import { updatePlayerProjectiles, updateEnemyProjectiles } from '../gameLogic/projectileLogic';
import { updatePlayerMovement, handlePlayerShooting, updatePlayerBuffsAndInvulnerability, processPlayerDamage, handleEntropicFragmentCollection } from '../gameLogic/playerLogic';
import { spawnEnemiesForWave, createBoss, updateEnemyAIAndMovement, applyPlayerProjectileDamageToEnemies, applyAoeDamageToEnemies } from '../gameLogic/enemyLogic';
import { calculateEnemiesForWave, isBossWave } from '../gameLogic/waveLogic';
import { createNewTemporaryEffect, updateTemporaryEffects } from '../gameLogic/effectsLogic';


interface GameViewProps {
  onGameOver: (score: number, level: number) => void;
  isEffectivelyPlaying: boolean;
  selectedStaff: Staff;
  selectedAccessory: Accessory;
}

interface Point { x: number; y: number; }

const LIGHTNING_BOLT_VISUAL_WIDTH = 30;


const generateSmoothGroundPath = (nodes: Point[], tension: number = 0.5): { stroke: string, fill: string } => {
  if (nodes.length < 2) return { stroke: '', fill: '' };
  let strokePath = `M ${nodes[0].x} ${nodes[0].y}`;
  let fillPath = strokePath;
  for (let i = 0; i < nodes.length - 1; i++) {
    const p0 = i > 0 ? nodes[i - 1] : nodes[i]; 
    const p1 = nodes[i];                          
    const p2 = nodes[i + 1];                      
    const p3 = i < nodes.length - 2 ? nodes[i + 2] : nodes[i+1]; 
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3; 
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
    const cp1 = { x: Math.max(Math.min(p1.x, p2.x), Math.min(Math.max(p1.x, p2.x), cp1x)), y: cp1y };
    const cp2 = { x: Math.max(Math.min(p1.x, p2.x), Math.min(Math.max(p1.x, p2.x), cp2x)), y: cp2y };
    strokePath += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;
  }
  fillPath = strokePath + ` L ${GAME_WIDTH} ${GAME_HEIGHT} L 0 ${GAME_HEIGHT} Z`;
  return { stroke: strokePath, fill: fillPath };
};


const GameView: React.FC<GameViewProps> = ({ onGameOver, isEffectivelyPlaying, selectedStaff, selectedAccessory }) => {
  const mainGroundVisualNodes = useMemo(() => {
    return GROUND_NODE_POINTS.map(node => ({
      x: node.xFraction * GAME_WIDTH,
      y: GROUND_Y_LEVEL_VALUES[node.yLevel] || GROUND_Y_LEVEL_VALUES[0],
    }));
  }, []);
  const mainGroundVisualNodesRef = useRef(mainGroundVisualNodes);
  useEffect(() => { mainGroundVisualNodesRef.current = mainGroundVisualNodes; }, [mainGroundVisualNodes]);

  const [grassBlades, setGrassBlades] = useState<GrassBlade[]>([]);
  const [windTime, setWindTime] = useState(0); // For global wind effect

  useEffect(() => {
    const newGrassBlades: GrassBlade[] = [];
    const nodes = mainGroundVisualNodesRef.current;
    for (let i = 0; i < nodes.length -1; i++) {
        const node1 = nodes[i];
        const node2 = nodes[i+1];
        const segmentLength = Math.hypot(node2.x - node1.x, node2.y - node1.y);
        const bladesInThisSegment = Math.max(1, Math.round(segmentLength / (GAME_WIDTH / (nodes.length-1)) * GRASS_BLADE_COUNT_PER_SEGMENT * (0.8 + Math.random() * 0.4))); // Varied density

        for(let j=0; j < bladesInThisSegment; j++) {
            const t = (j + Math.random() * 0.8 - 0.4) / bladesInThisSegment; // Randomize t slightly
            const baseX = node1.x + (node2.x - node1.x) * t;
            const y = getVisualGroundYAtX(baseX, nodes); 
            const initialAngle = (Math.random() - 0.5) * 15; // More subtle initial lean
            const colorIndex = Math.floor(Math.random() * GRASS_COLORS.length);
            newGrassBlades.push({
                id: `grass-${i}-${j}`, baseX, x: baseX, y,
                height: GRASS_BLADE_BASE_HEIGHT + (Math.random() - 0.5) * GRASS_BLADE_HEIGHT_VARIATION,
                width: GRASS_BLADE_WIDTH * (0.8 + Math.random() * 0.4), // Vary width
                initialAngle, currentAngle: initialAngle, targetAngle: initialAngle,
                lastBentTime: 0,
                color: GRASS_COLORS[colorIndex],
                swayOffset: Math.random() * Math.PI * 2, // For varied wind timing
                stiffness: 0.5 + Math.random() * 0.5, // Varied stiffness
            });
        }
    }
    setGrassBlades(newGrassBlades.sort((a,b) => a.baseX - b.baseX)); // Sort for consistent rendering if needed
  }, [mainGroundVisualNodesRef]);


  const [player, setPlayer] = useState<Player>(() => {
    let statsCopy: PlayerStats = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));
    if (selectedAccessory && selectedAccessory.applyStats) {
      statsCopy = selectedAccessory.applyStats(statsCopy);
    }
    const playerW = PLAYER_BASE_WIDTH * statsCopy.playerSizeMultiplier;
    const playerH = PLAYER_BASE_HEIGHT * statsCopy.playerSizeMultiplier;
    const initialGroundNode = mainGroundVisualNodesRef.current[0] || { x: GAME_WIDTH / 4, y: GROUND_Y_LEVEL_VALUES[0] };
    const startingY = initialGroundNode.y - playerH;
    return {
      id: 'player', x: GAME_WIDTH / 4 - playerW / 2, y: startingY,
      vx: 0, vy: 0, width: playerW, height: playerH, stats: statsCopy,
      isInvulnerable: false, lastHitTime: 0, facingDirection: 'right',
      selectedStaffId: selectedStaff.id, selectedAccessoryId: selectedAccessory?.id,
      isEligibleForRanking: selectedAccessory?.id !== 'cartola_vigarista',
      isOnGround: true, jumpsLeft: statsCopy.maxJumps,
    };
  });

  const [enemies, setEnemies] = useState<Enemy[]>(() => {
    const currentWaveNum = 1;
    const numEnemiesToSpawn = calculateEnemiesForWave(currentWaveNum);
    const accessoryIdForSpawn = selectedAccessory?.id;
    let initialPlayerStatsCopy: PlayerStats = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));
    if (selectedAccessory && selectedAccessory.applyStats) {
      initialPlayerStatsCopy = selectedAccessory.applyStats(initialPlayerStatsCopy);
    }
    const initialPlayerW = PLAYER_BASE_WIDTH * initialPlayerStatsCopy.playerSizeMultiplier;
    const initialPlayerX = GAME_WIDTH / 4 - initialPlayerW / 2;
    return spawnEnemiesForWave(currentWaveNum, numEnemiesToSpawn, 0, accessoryIdForSpawn, initialPlayerX);
  });

  const [playerProjectiles, setPlayerProjectiles] = useState<Projectile[]>([]);
  const [enemyProjectilesData, setEnemyProjectilesData] = useState<Projectile[]>([]);
  const [healingOrbs, setHealingOrbs] = useState<HealingOrb[]>([]);
  const [entropicFragments, setEntropicFragments] = useState<EntropicFragment[]>([]); // New
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [temporaryEffects, setTemporaryEffectsData] = useState<TemporaryEffect[]>([]);

  const [gameTime, setGameTime] = useState(0);
  const [internalGameTime, setInternalGameTime] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Playing);
  const gameStatusRef = useRef(GameStatus.Playing);
  const initialWaveSpawned = useRef(enemies.length > 0);

  const [waveNumber, setWaveNumber] = useState(1);
  const [enemiesDefeatedThisWave, setEnemiesDefeatedThisWave] = useState(0);
  const [enemiesRequiredForWave, setEnemiesRequiredForWave] = useState(calculateEnemiesForWave(1));
  const waveInProgressRef = useRef(enemies.length > 0); 

  const [isBossFightActive, setIsBossFightActive] = useState(false);
  const defeatedThisTickRef = useRef(0);

  const [keysPressed, setKeysPressed] = useState<KeysPressed>({});
  const mousePosition = useRef<{ x: number; y: number }>({ x: GAME_WIDTH / 2, y: 0 });
  const lastPlayerShotTime = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [isShaking, setIsShaking] = useState(false); // For screenshake
  const shakeTimeoutRef = useRef<number | null>(null);
  const lastFrameTime = useRef(performance.now());
  const [currentUpgradeChoices, setCurrentUpgradeChoices] = useState<Upgrade[]>([]);
  const [activeDynamicEvent, setActiveDynamicEvent] = useState<ActiveDynamicEvent | null>(null);


  const playerRef = useRef(player); useEffect(() => { playerRef.current = player; }, [player]);
  // No enemiesRef needed for triggerChainExplosion as it takes enemy list as parameter
  
  const triggerScreenShake = useCallback((intensity: number, duration: number) => {
    if (gameAreaRef.current) {
        if (shakeTimeoutRef.current) {
            clearTimeout(shakeTimeoutRef.current);
            gameAreaRef.current.style.transform = ''; // Reset previous shake if any
        }
        setIsShaking(true); 

        const startTime = performance.now();
        const shake = () => {
            const elapsedTime = performance.now() - startTime;
            if (elapsedTime < duration && gameAreaRef.current) { // Check gameAreaRef.current
                const x = (Math.random() - 0.5) * intensity * (1 - elapsedTime/duration); 
                const y = (Math.random() - 0.5) * intensity * (1 - elapsedTime/duration);
                gameAreaRef.current.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else if (gameAreaRef.current) { // Check gameAreaRef.current
                gameAreaRef.current.style.transform = '';
                setIsShaking(false);
            }
        };
        requestAnimationFrame(shake);
    }
  }, []);


  useEffect(() => {
    if (gameStatus === GameStatus.Playing) {
      if (!initialWaveSpawned.current) {
        const currentWaveNum = 1;
        const numEnemiesToSpawn = calculateEnemiesForWave(currentWaveNum);
        const newWaveEnemiesToSpawn = spawnEnemiesForWave(
          currentWaveNum, numEnemiesToSpawn, 0, selectedAccessory?.id, playerRef.current.x
        );
        if (newWaveEnemiesToSpawn.length > 0) {
          setEnemies([...newWaveEnemiesToSpawn]);
          setWaveNumber(currentWaveNum);
          setEnemiesRequiredForWave(numEnemiesToSpawn);
          setEnemiesDefeatedThisWave(0);
          waveInProgressRef.current = true;
          initialWaveSpawned.current = true; 
        }
      }
    }
  }, [gameStatus, selectedAccessory?.id]);

  useEffect(() => {
    return () => {
        audioManager.stopSound('game_music');
        audioManager.stopSound('boss_attack_beam_fire'); 
        audioManager.stopSound('sentinela_heal_beam_loop');
        // Stop any other relevant looping sounds here
    };
  }, []);


  const addFloatingText = useCallback((text: string, x: number, y: number, color: string, isCrit?: boolean, options?: Partial<FloatingText>) => {
    setFloatingTexts(prev => [...prev, { 
        id: `${Date.now()}-${Math.random()}`, text, x, y, color, 
        timestamp: Date.now(), duration: options?.duration || FLOATING_TEXT_DURATION, 
        isCrit, ...options 
    }]);
  }, []);

  const addTempEffect = useCallback((effectData: Omit<TemporaryEffect, 'id' | 'createdAt' | 'hitEnemyIds'>) => {
    setTemporaryEffectsData(prev => [...prev, createNewTemporaryEffect(effectData)]);
  }, []);

  const spawnAdditionalProjectile = useCallback((projectileData: Omit<Projectile, 'id'>) => {
    const newProj: Projectile = {
        ...projectileData,
        id: `ap-${Date.now()}-${Math.random()}`,
    };
    setPlayerProjectiles(prev => [...prev, newProj]);
  }, []);


  const spawnParticleEffect = useCallback((x: number, y: number, type: 'enemy_death' | 'projectile_impact') => {
    const config = type === 'enemy_death' ? {
        duration: ENEMY_DEATH_PARTICLE_DURATION,
        count: ENEMY_DEATH_PARTICLE_COUNT,
        size: ENEMY_DEATH_PARTICLE_SIZE,
        speed: ENEMY_DEATH_PARTICLE_SPEED,
        colorBase: [200, 50, 50], 
        effectType: 'enemy_death_particles' as TemporaryEffectType
    } : {
        duration: PROJECTILE_IMPACT_PARTICLE_DURATION,
        count: PROJECTILE_IMPACT_PARTICLE_COUNT,
        size: PROJECTILE_IMPACT_PARTICLE_SIZE,
        speed: PROJECTILE_IMPACT_PARTICLE_SPEED,
        colorBase: [220, 220, 220], 
        effectType: 'projectile_impact_particles' as TemporaryEffectType
    };

    for (let i = 0; i < config.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = config.speed * (0.5 + Math.random() * 0.5);
        addFloatingText(
            '.', 
            x, y,
            `rgba(${config.colorBase[0] + (Math.random()-0.5)*50}, ${config.colorBase[1] + (Math.random()-0.5)*50}, ${config.colorBase[2] + (Math.random()-0.5)*50}, ${0.5 + Math.random()*0.5})`,
            false,
            {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                duration: config.duration * (0.7 + Math.random() * 0.6),
                size: config.size * (0.7 + Math.random() * 0.6)
            }
        );
    }
  }, [addFloatingText]);

  const spawnNewOrbCollectible = useCallback((x: number, y: number) => {
    setHealingOrbs(prev => [...prev, spawnNewOrb(x, y, mainGroundVisualNodesRef.current)]);
  }, []);

  const spawnNewEntropicFragment = useCallback((x: number, y: number) => {
    const groundY = getVisualGroundYAtX(x, mainGroundVisualNodesRef.current);
    setEntropicFragments(prev => [...prev, {
        id: `ef-${Date.now()}-${Math.random()}`,
        x: x - ENTROPIC_FRAGMENT_SIZE / 2,
        y: y - ENTROPIC_FRAGMENT_SIZE / 2,
        width: ENTROPIC_FRAGMENT_SIZE,
        height: ENTROPIC_FRAGMENT_SIZE,
        createdAt: Date.now(),
        vy: ORB_INITIAL_POP_VELOCITY, 
        isOnGround: false,
        groundY: groundY
    }]);
  }, []);


  const spawnEnemyProjectile = useCallback((enemy: Enemy, angle: number) => {
    if (enemy.type === 'slime' || enemy.type === 'sombra_ofuscante' || enemy.type === 'tecelao_gravitacional' || enemy.type === 'sentinela_reparadora') return;

    let visualType: ProjectileVisualType = 'default_magic';
    let color = '#FF0000'; 
    let projectileWidth = BASE_PROJECTILE_WIDTH;
    let projectileHeight = BASE_PROJECTILE_HEIGHT;
    let speed = ENEMY_PROJECTILE_SPEED;
    let damage = enemy.projectileDamage || 10;
    let shootSound: SoundEffectKey = 'enemy_shoot_generic';

    if (enemy.type === 'ufo_sniper') {
        visualType = 'ufo_projectile'; color = '#00FFFF'; shootSound = 'enemy_shoot_ufo';
    } else if (enemy.type === 'alien_swarmer') {
        visualType = 'alien_spit'; color = '#32CD32'; 
        projectileWidth = ALIEN_SPIT_WIDTH; projectileHeight = ALIEN_SPIT_HEIGHT;
        speed *= ALIEN_SWARMER_PROJECTILE_SPEED_MULTIPLIER;
        damage = ALIEN_SWARMER_PROJECTILE_DAMAGE; 
        shootSound = 'enemy_shoot_alien';
    } else if (enemy.type === 'shooter') { 
        visualType = 'default_magic'; color = '#FF00FF'; 
    } else if (enemy.isBoss) {
    }


    audioManager.playSound(shootSound);
    const newProj: Projectile = {
        id: `ep-${Date.now()}-${Math.random()}`,
        x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2,
        width: projectileWidth, height: projectileHeight,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        damage: damage, isPlayerProjectile: false, color: color,
        visualType: visualType, staffId: 'enemy_staff', originalShooterId: enemy.id,
    };
    setEnemyProjectilesData(prev => [...prev, newProj]);
  }, []);


const triggerChainExplosion = useCallback((
    x: number, y: number, initialDamage: number, radius: number,
    currentChainDepth: number, shooterId: string,
    currentEnemyList: Enemy[] // Input list, not from ref
): { updatedEnemyList: Enemy[], killsThisChainAndSubChains: number } => {
    const currentPlayerStats = playerRef.current.stats; // playerRef is generally safe here
    if (!currentPlayerStats.chainExplosion.enabled || currentChainDepth > currentPlayerStats.chainExplosion.maxChainDepth) {
        return { updatedEnemyList: currentEnemyList, killsThisChainAndSubChains: 0 };
    }

    audioManager.playSound('projectile_explode', { volume: Math.max(0.2, 0.7 - currentChainDepth * 0.15) });
    addTempEffect({
        x: x - radius, y: y - radius, width: radius * 2, height: radius * 2,
        effectType: 'explosion_aoe', duration: EXPLOSION_EFFECT_DURATION, damage: initialDamage // Damage is applied by applyAoeDamage
    });

    let killsFromThisSpecificExplosion = 0;
    const enemiesKilledByThisExplosionForNextChain: Enemy[] = [];

    // Create a new list based on the input list, applying damage from this specific explosion
    let enemyListAfterThisExplosion = currentEnemyList.map(eMap => {
        if (eMap.hp <= 0 || eMap.isDying) return eMap; // Already dead or dying, skip

        const enemyCenterX = eMap.x + eMap.width / 2;
        const enemyCenterY = eMap.y + eMap.height / 2;
        const distSq = (enemyCenterX - x) ** 2 + (enemyCenterY - y) ** 2;

        if (distSq < radius ** 2) {
            // Enemy is hit by this explosion
            addFloatingText(Math.ceil(initialDamage).toString(), eMap.x + eMap.width / 2, eMap.y, '#FFA500');
            const originalHp = eMap.hp;
            let newHp = eMap.hp - initialDamage;

            if (Math.floor(newHp) <= 0 && originalHp > 0) { // Killed by THIS explosion
                newHp = 0;
                killsFromThisSpecificExplosion++;

                if (eMap.type !== 'slime') {
                    // Store its data (as it was *before* this damage) for potential sub-chains
                    enemiesKilledByThisExplosionForNextChain.push(JSON.parse(JSON.stringify(eMap)));

                    // Handle immediate death effects for non-slimes killed by chain
                    if (shooterId === playerRef.current.id && !eMap.isBoss) {
                         if (Math.random() < currentPlayerStats.healOrbChance) spawnNewOrbCollectible(eMap.x + eMap.width/2, eMap.y + eMap.height/2);
                         if (currentPlayerStats.ownedUpgrades['conversor_entropico'] && Math.random() < ENTROPIC_FRAGMENT_DROP_CHANCE) spawnNewEntropicFragment(eMap.x + eMap.width/2, eMap.y + eMap.height/2);
                         spawnParticleEffect(eMap.x + eMap.width/2, eMap.y + eMap.height/2, 'enemy_death');
                         audioManager.playSound(eMap.isBoss ? 'boss_death' : 'enemy_death_generic');
                    }
                }
                // Slime death (setting isDying etc.) will be handled by a later pass in main loop if its hp is 0.
            }
            return { ...eMap, hp: newHp };
        }
        return eMap;
    });

    let totalKillsIncludingSubChains = killsFromThisSpecificExplosion;
    let finalEnemyListFromAllSubChains = enemyListAfterThisExplosion;

    for (const killedEnemyDataForSubChain of enemiesKilledByThisExplosionForNextChain) {
        const nextDamage = currentPlayerStats.chainExplosion.baseDamage * (0.8 + currentPlayerStats.chainExplosion.level * 0.1);
        const nextRadius = currentPlayerStats.chainExplosion.baseRadius * (0.8 + currentPlayerStats.chainExplosion.level * 0.1);

        const subChainResult = triggerChainExplosion(
            killedEnemyDataForSubChain.x + killedEnemyDataForSubChain.width / 2,
            killedEnemyDataForSubChain.y + killedEnemyDataForSubChain.height / 2,
            nextDamage, nextRadius, currentChainDepth + 1, shooterId,
            finalEnemyListFromAllSubChains // Pass the list updated by the current explosion/previous sub-chains
        );
        finalEnemyListFromAllSubChains = subChainResult.updatedEnemyList;
        totalKillsIncludingSubChains += subChainResult.killsThisChainAndSubChains;
    }
    return { updatedEnemyList: finalEnemyListFromAllSubChains, killsThisChainAndSubChains: totalKillsIncludingSubChains };
}, [addFloatingText, addTempEffect, spawnParticleEffect, spawnNewOrbCollectible, spawnNewEntropicFragment, playerRef]);


  const generateUpgradeChoices = useCallback(() => {
    const rarityOrder = [Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.Epic, Rarity.Ascension, Rarity.Celestial]; // Added Epic, Ascension
    
    const luckAdjustedWeight = (baseWeight: number, rarity: Rarity): number => {
        const luck = playerRef.current.stats.luckFactor || 0;
        switch (rarity) {
            case Rarity.Common: return baseWeight * Math.max(0.1, 1 - luck * 0.75); // More luck = less common
            case Rarity.Uncommon: return baseWeight * (1 + luck * 0.25);
            case Rarity.Rare: return baseWeight * (1 + luck * 0.5);
            case Rarity.Epic: return baseWeight * (1 + luck * 0.75);
            case Rarity.Ascension: return baseWeight * (1 + luck * 1.0);
            case Rarity.Celestial: return baseWeight * (1 + luck * 1.25); // Most affected by luck
            default: return baseWeight;
        }
    };

    const weightedUpgrades = UPGRADES.flatMap(u => {
      const currentLevel = playerRef.current.stats.ownedUpgrades[u.id] || 0;
      if (u.maxLevel && currentLevel >= u.maxLevel) return [];
      
      // Specific requirement checks
      if (u.id === 'alma_cajado_pipoca' && selectedStaff.id !== 'canhao_pipoca') return [];
      if (u.requires) {
          for (const reqId of u.requires) {
              if (!playerRef.current.stats.ownedUpgrades[reqId]) return []; // Requirement not met
          }
      }
      
      // Base weights, adjusted for new rarities
      let baseWeight = 10; // Default for Common
      if (u.rarity === Rarity.Uncommon) baseWeight = 7;
      else if (u.rarity === Rarity.Rare) baseWeight = 4;
      else if (u.rarity === Rarity.Epic) baseWeight = 2.5;
      else if (u.rarity === Rarity.Ascension) baseWeight = 1;
      else if (u.rarity === Rarity.Celestial) baseWeight = 0.5;
      
      let calculatedWeight = luckAdjustedWeight(baseWeight, u.rarity);
      
      // Ensure weight is a finite, non-negative number before rounding. Default to 1 if problematic.
      if (!isFinite(calculatedWeight) || calculatedWeight < 0) {
          calculatedWeight = 1;
      }
      const finalWeight = Math.max(1, Math.round(calculatedWeight));
      
      return Array(finalWeight).fill(u);
    });

    let choices: Upgrade[] = [];
    let available = [...weightedUpgrades];
    const maxChoices = playerRef.current.stats.upgradeChoices;

    while (choices.length < maxChoices && available.length > 0) {
        let randIndex = Math.floor(Math.random() * available.length);
        let newChoice = available[randIndex];
        const currentChoiceLevel = playerRef.current.stats.ownedUpgrades[newChoice.id] || 0;
        
        if (!choices.some(c => c.id === newChoice.id) && (!newChoice.maxLevel || currentChoiceLevel < newChoice.maxLevel)) {
            choices.push(newChoice);
        }
        available.splice(randIndex, 1); 
        
        if (available.length === 0 && choices.length < maxChoices) { 
             available = UPGRADES.filter(u =>
                !choices.some(c => c.id === u.id) &&
                (!u.maxLevel || (playerRef.current.stats.ownedUpgrades[u.id] || 0) < u.maxLevel) &&
                !(u.id === 'alma_cajado_pipoca' && selectedStaff.id !== 'canhao_pipoca') &&
                !(u.requires && u.requires.some(reqId => !playerRef.current.stats.ownedUpgrades[reqId]))
            );
             available = available.filter(u => !choices.some(c => c.id === u.id)); 
        }
    }
    choices.sort((a,b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
    setCurrentUpgradeChoices(choices);
  }, [selectedStaff.id]); 

  const prepareForUpgradeSelection = useCallback(() => {
    waveInProgressRef.current = false;
    gameStatusRef.current = GameStatus.Paused;
    setActiveDynamicEvent(null); 
    audioManager.playSound('level_up');
    setPlayer(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        currentHp: Math.min(prev.stats.maxHp, prev.stats.currentHp + prev.stats.maxHp * 0.25),
        level: prev.stats.level + 1,
      }
    }));
    generateUpgradeChoices();
    setGameStatus(GameStatus.Paused);
    audioManager.stopSound('game_music');
    audioManager.stopSound('streamer_beam_loop');
    enemies.forEach(enemy => { // Stop individual healing beams
        if (enemy.type === 'sentinela_reparadora') {
            audioManager.stopSound(`heal_beam_${enemy.id}`);
        }
    });

  }, [generateUpgradeChoices, enemies]); // Added enemies to dependency array for sentinela heal beam stop

  const internalSpawnWaveEnemies = useCallback((currentWaveNum: number, numEnemiesToSpawn: number) => {
    waveInProgressRef.current = true;
    gameStatusRef.current = GameStatus.Playing;
    setTemporaryEffectsData([]);
    setEnemiesDefeatedThisWave(0);
    const newWaveEnemies = spawnEnemiesForWave(currentWaveNum, numEnemiesToSpawn, internalGameTime, playerRef.current.selectedAccessoryId, playerRef.current.x);
    setEnemies([...newWaveEnemies]);
    setEnemiesRequiredForWave(numEnemiesToSpawn);

    if (currentWaveNum % 3 === 0 && !isBossWave(currentWaveNum)) {
        audioManager.playSound('meteor_warn', { volume: 0.8 });
        setActiveDynamicEvent({
            type: 'meteor_shower',
            startTime: Date.now(),
            duration: METEOR_SHOWER_EVENT_DURATION,
            lastMeteorSpawnTime: Date.now()
        });
        addFloatingText('ALERTA: CHUVA DE METEOROS!', GAME_WIDTH / 2, GAME_HEIGHT / 5, '#FF8C00', true, {duration: 3000, size: 20});
    }

  }, [internalGameTime, addFloatingText]); 

  const startNextWave = useCallback(() => {
    waveInProgressRef.current = true;
    gameStatusRef.current = GameStatus.Playing;
    setTemporaryEffectsData([]);
    const nextWaveNumber = waveNumber + 1;
    setWaveNumber(nextWaveNumber);
    setEnemiesDefeatedThisWave(0); // Reset for the new wave
    audioManager.playSound('wave_start');
    if (isBossWave(nextWaveNumber)) {
        setIsBossFightActive(true);
        setActiveDynamicEvent(null); 
        const boss = createBoss(nextWaveNumber);
        setEnemies([boss]);
        audioManager.playSound('boss_spawn');
        addFloatingText(`!!! CHEFE ONDA ${nextWaveNumber} !!!`, GAME_WIDTH / 2, GAME_HEIGHT / 4, '#FF0000', true);
        setEnemiesRequiredForWave(1); 
    } else {
        setIsBossFightActive(false);
        const numEnemies = calculateEnemiesForWave(nextWaveNumber);
        internalSpawnWaveEnemies(nextWaveNumber, numEnemies);
        addFloatingText(`ONDA ${nextWaveNumber}!`, GAME_WIDTH / 2, GAME_HEIGHT / 3, '#FFFF00', true);
    }
    setGameStatus(GameStatus.Playing); 
    audioManager.playSound('ambient_music_game', { loop: true, id: 'game_music' });
  }, [waveNumber, internalSpawnWaveEnemies, addFloatingText]);

  const handleSelectUpgrade = useCallback((upgrade: Upgrade) => {
    setPlayer(prevPlayer => {
        const newStats = JSON.parse(JSON.stringify(prevPlayer.stats)); 
        upgrade.apply(newStats, (newStats.ownedUpgrades[upgrade.id] || 0) + 1); // Pass next level
        newStats.ownedUpgrades[upgrade.id] = (newStats.ownedUpgrades[upgrade.id] || 0) + 1;
        if (upgrade.id === 'escudo_reativo' && newStats.shield.enabled && !newStats.shield.active && !newStats.shield.cooldownActive) {
            newStats.shield.active = true;
        }
        if (upgrade.id === 'conversor_entropico') {
            newStats.collectedEntropicFragments = 0;
            newStats.entropicBuffDuration = 0;
        }
        return { ...prevPlayer, stats: newStats };
    });
    setCurrentUpgradeChoices([]);
    startNextWave();
  }, [startNextWave]);

  const handleRerollUpgrades = useCallback(() => {
    if (playerRef.current.stats.rerollsAvailable > 0) {
      setPlayer(prev => ({
        ...prev,
        stats: { ...prev.stats, rerollsAvailable: prev.stats.rerollsAvailable - 1 }
      }));
      generateUpgradeChoices();
    }
  }, [generateUpgradeChoices]);

  // Game Loop
  useEffect(() => {
    let gameLoopId: number | undefined = undefined;

    if (isEffectivelyPlaying && gameStatusRef.current === GameStatus.Playing) {
      gameLoopId = requestAnimationFrame(() => {
        const now = performance.now();
        const rawDelta = (now - lastFrameTime.current) / 1000;
        const delta = Math.max(0.008, Math.min(0.05, rawDelta)); 
        lastFrameTime.current = now;
        defeatedThisTickRef.current = 0; 
        
        setInternalGameTime(prev => prev + delta * 1000);
        if (Math.floor(internalGameTime / 1000) !== gameTime) {
            setGameTime(Math.floor(internalGameTime / 1000));
        }
        setWindTime(prevTime => prevTime + delta * GRASS_WIND_SPEED);

        const playerBuffAndInvulnUpdates = updatePlayerBuffsAndInvulnerability(playerRef.current, now, delta, addFloatingText);
        setPlayer(p => ({ ...p, ...playerBuffAndInvulnUpdates }));

        const playerMovementUpdates = updatePlayerMovement(playerRef.current, keysPressed, delta, mousePosition.current.x, playerRef.current.stats.coffeeBuff.active, playerRef.current.stats.coffeeBuff.speedMultiplier, mainGroundVisualNodesRef.current);
        setPlayer(p => ({ ...p, ...playerMovementUpdates }));

        // Friction Upgrade Logic
        if (playerRef.current.stats.frictionStats.enabled && Math.abs(playerRef.current.vx) > 0) {
            const distanceMoved = Math.abs(playerRef.current.vx) * delta;
            const newTotalDistance = playerRef.current.stats.frictionStats.distanceRunSinceLastActivation + distanceMoved;

            if (newTotalDistance >= playerRef.current.stats.frictionStats.distancePerProjectile) {
                const activations = Math.floor(newTotalDistance / playerRef.current.stats.frictionStats.distancePerProjectile);
                const pStats = playerRef.current.stats;
                
                for (let act = 0; act < activations; act++) {
                    for (let i = 0; i < pStats.frictionStats.projectilesPerActivation; i++) {
                        const frictionProjectile: Omit<Projectile, 'id'> = {
                            x: playerRef.current.x + playerRef.current.width / 2,
                            y: playerRef.current.y + playerRef.current.height / 2,
                            width: 8, height: 18, // friction_spark size
                            vx: (Math.random() - 0.5) * 50, // Slight horizontal spread
                            vy: -BASE_PLAYER_PROJECTILE_SPEED * 0.6, // Upwards
                            damage: pStats.frictionStats.projectileDamage,
                            isPlayerProjectile: true,
                            color: '#FFA500', // Orange/Red
                            visualType: 'friction_spark',
                            staffId: 'friction_ability',
                            originalShooterId: playerRef.current.id,
                            pierceLeft: 0,
                            explodesOnImpact: true,
                            explosionRadius: pStats.frictionStats.explosionRadius * pStats.antiAircraftFrictionRadiusMultiplier,
                        };
                        spawnAdditionalProjectile(frictionProjectile);
                    }
                }
                audioManager.playSound('friction_projectile_launch', { volume: 0.3 });
                setPlayer(p => ({
                    ...p,
                    stats: {
                        ...p.stats,
                        frictionStats: {
                            ...p.stats.frictionStats,
                            distanceRunSinceLastActivation: newTotalDistance % p.stats.frictionStats.distancePerProjectile,
                        }
                    }
                }));

            } else {
                 setPlayer(p => ({
                    ...p,
                    stats: {
                        ...p.stats,
                        frictionStats: {
                            ...p.stats.frictionStats,
                            distanceRunSinceLastActivation: newTotalDistance,
                        }
                    }
                }));
            }
        }


        let currentEnemiesList = enemies; 

        if (keysPressed['mouse0']) {
          const shootResult = handlePlayerShooting(playerRef.current, selectedStaff, mousePosition.current, now, lastPlayerShotTime.current, playerRef.current.stats.coffeeBuff.active, playerRef.current.stats.coffeeBuff.fireRateMultiplier, currentEnemiesList, isBossFightActive);
          if (shootResult.projectiles.length > 0) setPlayerProjectiles(prev => [...prev, ...shootResult.projectiles]);
          lastPlayerShotTime.current = shootResult.newLastShotTime;
        }
        
        setPlayerProjectiles(prev => updatePlayerProjectiles(prev, delta, currentEnemiesList, isBossFightActive, addTempEffect)); 
        setEnemyProjectilesData(prev => updateEnemyProjectiles(prev, delta, playerRef.current));
        
        const enemyUpdateResult = updateEnemyAIAndMovement(
            currentEnemiesList, playerRef.current, delta, now, 
            spawnEnemyProjectile, addTempEffect,
            mainGroundVisualNodesRef.current, playerRef.current.stats, 
            spawnNewOrbCollectible, spawnNewEntropicFragment, spawnParticleEffect
        );
        currentEnemiesList = enemyUpdateResult.updatedEnemies;
        
        // Lightning Strikes Logic
        if (playerRef.current.stats.lightningStrikes.enabled && 
            now - playerRef.current.stats.lightningStrikes.lastCycleTime > playerRef.current.stats.lightningStrikes.cooldown) {
            
            setPlayer(p => ({
                ...p,
                stats: {
                    ...p.stats,
                    lightningStrikes: {
                        ...p.stats.lightningStrikes,
                        lastCycleTime: now,
                    }
                }
            }));

            for (let i = 0; i < playerRef.current.stats.lightningStrikes.strikesPerCycle; i++) {
                let targetX: number;
                // let targetY: number; // Target Y is not needed for a full sky bolt
                // const lightningRadius = playerRef.current.stats.lightningStrikes.radius; // Used for warning
                const aliveEnemies = currentEnemiesList.filter(e => e.hp > 0 && !e.isDying);

                if (aliveEnemies.length > 0) {
                    const randomEnemyIndex = Math.floor(Math.random() * aliveEnemies.length);
                    const targetEnemy = aliveEnemies[randomEnemyIndex];
                    targetX = targetEnemy.x + targetEnemy.width / 2;
                    // targetY = targetEnemy.y + targetEnemy.height / 2; // Not used for bolt's y
                } else {
                    targetX = playerRef.current.x + playerRef.current.width / 2 + (Math.random() - 0.5) * 200;
                    // targetY = playerRef.current.y + playerRef.current.height / 2 + (Math.random() - 0.5) * 100; // Not used
                    targetX = Math.max(LIGHTNING_BOLT_VISUAL_WIDTH / 2, Math.min(GAME_WIDTH - LIGHTNING_BOLT_VISUAL_WIDTH / 2, targetX));
                }
                
                addTempEffect({
                    x: targetX - LIGHTNING_BOLT_VISUAL_WIDTH / 2, 
                    y: 0, 
                    width: LIGHTNING_BOLT_VISUAL_WIDTH,
                    height: GAME_HEIGHT, 
                    effectType: 'lightning_aoe',
                    duration: LIGHTNING_WARN_DURATION + EXPLOSION_EFFECT_DURATION, 
                    damage: playerRef.current.stats.lightningStrikes.damage,
                });
                audioManager.playSound('projectile_explode', { volume: 0.7 }); 
            }
        }
        
        const projectileDamageResult = applyPlayerProjectileDamageToEnemies(
            currentEnemiesList, playerProjectiles, playerRef.current.stats, 
            addFloatingText, addTempEffect, spawnParticleEffect, spawnNewEntropicFragment, spawnAdditionalProjectile, spawnNewOrbCollectible
        );
        currentEnemiesList = projectileDamageResult.updatedEnemies;
         if (projectileDamageResult.consumedProjectileIds.size > 0) {
            setPlayerProjectiles(prev => prev.filter(p => !projectileDamageResult.consumedProjectileIds.has(p.id)));
        }
        
        const updatedActiveTempEffects = updateTemporaryEffects(temporaryEffects, now);
        
        const aoeDamageResult = applyAoeDamageToEnemies(
            currentEnemiesList, updatedActiveTempEffects, now, addFloatingText, spawnParticleEffect, playerRef.current.stats, spawnNewOrbCollectible, spawnNewEntropicFragment
        );
        currentEnemiesList = aoeDamageResult.updatedEnemies;
        setTemporaryEffectsData(aoeDamageResult.updatedEffects); 

        const uniqueNewlyDefeatedData = new Map<string, Enemy>();
        projectileDamageResult.newlyDefeatedEnemyData.forEach(e => {
            if (!uniqueNewlyDefeatedData.has(e.id)) uniqueNewlyDefeatedData.set(e.id, e);
        });
        aoeDamageResult.newlyDefeatedEnemyData.forEach(e => {
            if (!uniqueNewlyDefeatedData.has(e.id)) uniqueNewlyDefeatedData.set(e.id, e);
        });
        const allDirectlyDefeatedEnemies = Array.from(uniqueNewlyDefeatedData.values());
        defeatedThisTickRef.current += allDirectlyDefeatedEnemies.length;

        // Chain Explosion Logic
        let enemyListAfterChains = currentEnemiesList;
        let totalKillsFromAllChainsThisTick = 0;

        for (const initiallyDefeatedEnemy of allDirectlyDefeatedEnemies) {
            if (initiallyDefeatedEnemy.type !== 'slime' &&
                !initiallyDefeatedEnemy.isBoss &&
                playerRef.current.stats.chainExplosion.enabled) {
                
                const chainResult = triggerChainExplosion(
                    initiallyDefeatedEnemy.x + initiallyDefeatedEnemy.width / 2,
                    initiallyDefeatedEnemy.y + initiallyDefeatedEnemy.height / 2,
                    playerRef.current.stats.chainExplosion.baseDamage,
                    playerRef.current.stats.chainExplosion.baseRadius,
                    0, 
                    playerRef.current.id,
                    enemyListAfterChains 
                );
                enemyListAfterChains = chainResult.updatedEnemyList;
                totalKillsFromAllChainsThisTick += chainResult.killsThisChainAndSubChains;
            }
        }
        currentEnemiesList = enemyListAfterChains;
        defeatedThisTickRef.current += totalKillsFromAllChainsThisTick;

        const playerDamageResult = processPlayerDamage(playerRef.current, enemyProjectilesData, currentEnemiesList, now, addFloatingText, triggerScreenShake);
        if (playerDamageResult.damageTaken > 0 || playerDamageResult.invulnerabilityTriggered || playerDamageResult.shieldBroken) {
            if (playerDamageResult.damageTaken > 0) triggerScreenShake(playerDamageResult.damageTaken > 15 ? 4 : 2, 150);
            setPlayer(p => {
                let newHp = p.stats.currentHp - playerDamageResult.damageTaken;
                let newShieldState = p.stats.shield;
                if (playerDamageResult.shieldBroken && p.stats.shield.enabled && p.stats.shield.active) {
                  newShieldState = { ...p.stats.shield, active: false, cooldownActive: true, cooldownTimeLeft: p.stats.shield.maxCooldown };
                  audioManager.playSound('player_shield_block');
                }
                if (playerDamageResult.damageTaken > 0 && !playerDamageResult.shieldBroken) audioManager.playSound('player_hit');
                return {
                    ...p,
                    stats: { ...p.stats, currentHp: Math.max(0, newHp), shield: newShieldState },
                    isInvulnerable: playerDamageResult.invulnerabilityTriggered ? true : p.isInvulnerable,
                    lastHitTime: playerDamageResult.invulnerabilityTriggered ? now : p.lastHitTime,
                };
            });
        }
        if (playerDamageResult.projectilesToConsume.length > 0) {
            setEnemyProjectilesData(prev => prev.filter(ep => !playerDamageResult.projectilesToConsume.includes(ep.id)));
        }

        setHealingOrbs(prev => updateOrbs(prev, delta, now, playerRef.current, (orb, pData) => {
          audioManager.playSound('orb_collect_heal');
          setPlayer(p => {
              const newPlayerStats = {...p.stats};
              newPlayerStats.currentHp = Math.min(newPlayerStats.maxHp, newPlayerStats.currentHp + orb.healAmount);
              if (newPlayerStats.coffeeBuff.speedMultiplier > 0 ) { 
                  newPlayerStats.coffeeBuff.active = true;
                  newPlayerStats.coffeeBuff.durationLeft = 5000;
                  addFloatingText('☕ Boost!', p.x + p.width/2, p.y - 15, '#FFD700');
              }
              return {...p, stats: newPlayerStats};
          });
          addFloatingText(`+${orb.healAmount}`, orb.x + orb.width / 2, orb.y, '#32CD32');
        }, mainGroundVisualNodesRef.current));

        setEntropicFragments(prevFragments => {
            const collectedIds = new Set<string>();
            const updatedFragments = prevFragments.map(frag => {
                if (rectCollision(playerRef.current, frag)) {
                    collectedIds.add(frag.id);
                    audioManager.playSound('entropic_fragment_collect');
                    setPlayer(p => ({...p, ...handleEntropicFragmentCollection(p, frag, addFloatingText)}));
                    return null; 
                }
                if (frag.isOnGround) return frag;
                let newVy = frag.vy + ORB_GRAVITY * delta;
                let newY = frag.y + newVy * delta;
                let landed = false;
                const groundY = frag.groundY !== undefined ? frag.groundY : getVisualGroundYAtX(frag.x + frag.width/2, mainGroundVisualNodesRef.current);
                if (newY + frag.height >= groundY) {
                    newY = groundY - frag.height; newVy = 0; landed = true;
                }
                if (newY + frag.height >= GAME_HEIGHT) { newY = GAME_HEIGHT - frag.height; if (!landed) newVy = 0; landed = true; }
                return {...frag, y: newY, vy: newVy, isOnGround: landed};
            }).filter(frag => frag !== null && now - frag.createdAt < ENTROPIC_FRAGMENT_DURATION) as EntropicFragment[];
            return updatedFragments;
        });


        setFloatingTexts(prev => prev
            .map(ft => ({ ...ft, 
                x: ft.vx ? ft.x + ft.vx * delta : ft.x,
                y: ft.vy ? ft.y + ft.vy * delta : ft.y - 30 * delta 
            }))
            .filter(ft => now - ft.timestamp < ft.duration)
        );
        
        setGrassBlades(prevBlades => prevBlades.map(blade => {
            let newAngle = blade.currentAngle;
            let targetAngle = blade.initialAngle;
            
            const windInfluence = Math.sin(windTime + blade.swayOffset) * GRASS_WIND_STRENGTH * (1 / blade.stiffness);
            targetAngle += windInfluence;

            const distToPlayer = Math.hypot(blade.baseX - (player.x + player.width / 2), blade.y - (player.y + player.height));
            if (distToPlayer < GRASS_PLAYER_INTERACTION_RADIUS && player.y + player.height > blade.y - blade.height) { 
                const bendDirection = (player.x + player.width / 2) > blade.baseX ? -1 : 1;
                const playerSpeedFactor = Math.max(0.3, Math.min(1, Math.abs(player.vx || 0) / (player.stats.speed * 0.5))); 
                targetAngle = blade.initialAngle + GRASS_BEND_ANGLE * bendDirection * playerSpeedFactor * (1 / blade.stiffness);
                blade.lastBentTime = now;
            }
            
            blade.targetAngle = targetAngle;

            if (blade.currentAngle !== blade.targetAngle) {
                const diff = blade.targetAngle - blade.currentAngle;
                const change = GRASS_BEND_RECOVERY_SPEED * delta * blade.stiffness * Math.sign(diff); 
                if (Math.abs(diff) < Math.abs(change)) newAngle = blade.targetAngle;
                else newAngle += change;
            }
            return { ...blade, currentAngle: newAngle, x: blade.baseX }; 
        }));

        if (activeDynamicEvent && activeDynamicEvent.type === 'meteor_shower') {
            if (now - activeDynamicEvent.startTime > activeDynamicEvent.duration) {
                setActiveDynamicEvent(null); 
            } else if (now - (activeDynamicEvent.lastMeteorSpawnTime || 0) > METEOR_SPAWN_INTERVAL) {
                audioManager.playSound('meteor_warn');
                const meteorX = Math.random() * GAME_WIDTH;
                const meteorWidth = METEOR_IMPACT_RADIUS * 2;
                addTempEffect({
                    x: meteorX - METEOR_IMPACT_RADIUS, y: 0, 
                    width: meteorWidth, height: METEOR_IMPACT_RADIUS * 0.5, 
                    effectType: 'meteor_impact_warning',
                    duration: METEOR_WARNING_DURATION,
                });
                activeDynamicEvent.lastMeteorSpawnTime = now;
            }
        }
        setTemporaryEffectsData(prevEffects => prevEffects.map(eff => {
            if (eff.effectType === 'meteor_impact_warning' && now - eff.createdAt >= eff.duration) {
                 triggerScreenShake(6, 300);
                 audioManager.playSound('meteor_impact');
                return createNewTemporaryEffect({
                    x: eff.x, 
                    y: getVisualGroundYAtX(eff.x + eff.width/2, mainGroundVisualNodesRef.current) - METEOR_IMPACT_RADIUS, 
                    width: METEOR_IMPACT_RADIUS * 2, height: METEOR_IMPACT_RADIUS * 2,
                    effectType: 'meteor_impact_aoe',
                    duration: EXPLOSION_EFFECT_DURATION * 1.5,
                    damage: METEOR_IMPACT_DAMAGE,
                });
            }
            return eff;
        }).filter(eff => !(eff.effectType === 'meteor_impact_warning' && now - eff.createdAt >= eff.duration) )); 


        let enemiesToSetState = currentEnemiesList.map(enemy => {
            // If an enemy's HP is 0 after all damage, and it's a slime not already dying, start its death animation
            if (enemy.type === 'slime' && enemy.hp === 0 && !enemy.isDying) {
                return {
                    ...enemy,
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
            // Non-slime enemies with HP 0 are handled by the filter below
            return enemy;
        });

        enemiesToSetState = enemiesToSetState.filter(e => {
            if (e.type === 'slime') {
                return e.hp !== -1; // Keep slimes unless their death animation is fully complete (hp becomes -1)
            }
            return e.hp > 0; // Keep non-slimes only if their HP is still > 0
        });
        setEnemies(enemiesToSetState);


        const currentTickTotalKills = defeatedThisTickRef.current;
        const potentialTotalDefeatedThisWave = enemiesDefeatedThisWave + currentTickTotalKills;
        let waveShouldEnd = false;

        if (gameStatusRef.current === GameStatus.Playing &&
            !isBossFightActive &&
            waveInProgressRef.current &&
            enemiesRequiredForWave > 0 &&
            potentialTotalDefeatedThisWave >= enemiesRequiredForWave) {
            
            const activeEnemiesStillPresent = enemiesToSetState.filter(enemyToCheck => {
                 if (enemyToCheck.isBoss) return false; 
                 return enemyToCheck.hp > 0; // Check based on the just-updated enemiesToSetState
            });

            if (activeEnemiesStillPresent.length === 0) {
                waveShouldEnd = true;
            }
        }

        if (waveShouldEnd) {
            prepareForUpgradeSelection();
            // setEnemiesDefeatedThisWave will be reset to 0 by startNextWave within handleSelectUpgrade
        } else {
            // If the wave is not ending, but there were kills, update the count for the next frame.
            if (currentTickTotalKills > 0) {
                setEnemiesDefeatedThisWave(prev => prev + currentTickTotalKills);
            }
        }


        if (playerRef.current.stats.currentHp <= 0 && gameStatusRef.current !== GameStatus.GameOver) {
          gameStatusRef.current = GameStatus.GameOver;
          waveInProgressRef.current = false;
          setActiveDynamicEvent(null);
          audioManager.playSound('player_death');
          audioManager.playSound('game_over_fanfare');
          audioManager.stopSound('game_music'); 
          audioManager.stopSound('boss_attack_beam_fire'); 
          audioManager.stopSound('sentinela_heal_beam_loop'); 
          enemies.forEach(enemy => {
            if (enemy.type === 'sentinela_reparadora') {
                audioManager.stopSound(`heal_beam_${enemy.id}`);
            }
          });

          setGameStatus(GameStatus.GameOver);
          onGameOver(gameTime, playerRef.current.stats.level);
        }
      });
    } else {
      lastFrameTime.current = performance.now();
    }

    return () => {
      if (gameLoopId !== undefined) {
        cancelAnimationFrame(gameLoopId);
      }
       if (shakeTimeoutRef.current) { 
            clearTimeout(shakeTimeoutRef.current);
            if (gameAreaRef.current) gameAreaRef.current.style.transform = '';
        }
    };
  }, [ 
      gameStatus, isEffectivelyPlaying, keysPressed, 
      internalGameTime, gameTime, windTime, 
      selectedStaff,
      waveNumber, enemiesDefeatedThisWave, enemiesRequiredForWave, isBossFightActive,
      onGameOver, prepareForUpgradeSelection, addFloatingText, addTempEffect, triggerChainExplosion, spawnParticleEffect, spawnNewOrbCollectible, spawnNewEntropicFragment,
      handleSelectUpgrade, generateUpgradeChoices, startNextWave, internalSpawnWaveEnemies, spawnEnemyProjectile,
      triggerScreenShake, activeDynamicEvent, spawnAdditionalProjectile, enemies, playerProjectiles, temporaryEffects // Added missing dependencies
  ]);


  // Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ') e.preventDefault();
        const key = e.key.toLowerCase();
        if ((key === 'w' || key === 'arrowup' || key === ' ') && !keysPressed['jump_action_pending']) {
             if (playerRef.current.jumpsLeft > 0 && playerRef.current.vy >= -PLAYER_JUMP_FORCE * 0.5) { 
                 audioManager.playSound('player_jump');
                 setKeysPressed(prev => ({ ...prev, ['jump_action_pending']: true, [key]: true })); 
             } else {
                 setKeysPressed(prev => ({ ...prev, [key]: true })); 
             }
        } else {
            setKeysPressed(prev => ({ ...prev, [key]: true }));
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    const handleMouseDown = (e: MouseEvent) => { if (e.button === 0) setKeysPressed(prev => ({ ...prev, mouse0: true })); };
    const handleMouseUp = (e: MouseEvent) => { if (e.button === 0) setKeysPressed(prev => ({ ...prev, mouse0: false })); };
    const handleMouseMove = (e: MouseEvent) => {
        if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            mousePosition.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('mousedown', handleMouseDown);
      gameArea.addEventListener('mouseup', handleMouseUp);
      gameArea.addEventListener('mousemove', handleMouseMove);
      gameArea.addEventListener('contextmenu', e => e.preventDefault());
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameArea) {
        gameArea.removeEventListener('mousedown', handleMouseDown);
        gameArea.removeEventListener('mouseup', handleMouseUp);
        gameArea.removeEventListener('mousemove', handleMouseMove);
        gameArea.removeEventListener('contextmenu', e => e.preventDefault());
      }
    };
  }, [keysPressed]); 

  useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);
  
  const mainGroundPathData = useMemo(() => {
    return generateSmoothGroundPath(mainGroundVisualNodesRef.current, GROUND_SMOOTHING_TENSION);
  }, [mainGroundVisualNodesRef]);


  if (!isEffectivelyPlaying && gameStatus !== GameStatus.GameOver && gameStatus !== GameStatus.Paused) return null;
  const currentBoss = enemies.find(e => e.isBoss && e.hp > 0) || null;

  return (
    <div
      ref={gameAreaRef}
      className="relative bg-slate-800 cursor-crosshair overflow-hidden shadow-2xl border-2 border-slate-700 rounded-lg"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} 
    >
      <StarfieldBackground />
      <ParallaxBackground cameraX={player.x} />

      {PLATFORMS.map(platform => (
        <div 
          key={`collision-${platform.id}`} className="absolute"
          style={{ left: platform.x, top: platform.y, width: platform.width, height: platform.height, opacity: 0, pointerEvents: 'none' }} 
        />
      ))}

      <svg width={GAME_WIDTH} height={GAME_HEIGHT} className="absolute top-0 left-0" style={{ zIndex: 1, pointerEvents: 'none' }}>
        <path d={mainGroundPathData.fill} fill={PLATFORM_BODY_COLOR} />
        {grassBlades.map(blade => (
            <rect
                key={blade.id}
                x={blade.x - blade.width / 2}
                y={blade.y - blade.height}
                width={blade.width}
                height={blade.height}
                fill={blade.color}
                style={{
                  transformOrigin: `${blade.x}px ${blade.y}px`,
                  transform: `rotate(${blade.currentAngle}deg)`,
                  transition: 'transform 0.1s linear' 
                }}
            />
        ))}
        <path d={mainGroundPathData.stroke} stroke={'transparent'} strokeWidth={PLATFORM_STROKE_THICKNESS} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      {temporaryEffects.map(effect => { 
        let effectVisual = null; const key = effect.id;
        const opacity = Math.max(0, 1 - (Date.now() - effect.createdAt) / effect.duration);
        
        switch (effect.effectType) {
            case 'lightning_aoe':
                const lightningStats = playerRef.current.stats.lightningStrikes;
                const warningRadiusActual = lightningStats.radius;
                const isWarningPhase = Date.now() - effect.createdAt < LIGHTNING_WARN_DURATION;

                if (isWarningPhase) {
                    const warningCenterX = effect.x + effect.width / 2; // Bolt's center X
                    const warningCenterY = getVisualGroundYAtX(warningCenterX, mainGroundVisualNodesRef.current);
                    effectVisual = (
                        <div
                            key={`${key}-warn`}
                            style={{
                                position: 'absolute',
                                left: warningCenterX - warningRadiusActual,
                                top: warningCenterY - warningRadiusActual,
                                width: warningRadiusActual * 2,
                                height: warningRadiusActual * 2,
                                borderRadius: '50%',
                                border: `3px dashed rgba(255, 255, 0, ${opacity})`,
                                backgroundColor: `rgba(255, 255, 0, ${opacity * 0.1})`,
                                zIndex: 4,
                                pointerEvents: 'none',
                            }}
                        />
                    );
                } else {
                    // Strike Visual (Vertical Bolt)
                    effectVisual = (
                        <div
                            key={key}
                            style={{
                                position: 'absolute',
                                left: effect.x,
                                top: effect.y, // Should be 0
                                width: effect.width,
                                height: effect.height, // Should be GAME_HEIGHT
                                backgroundColor: `rgba(255, 255, 180, ${opacity * 0.85})`,
                                boxShadow: `0 0 15px 7px rgba(255, 255, 100, ${opacity * 0.7}), inset 0 0 10px 2px rgba(255, 255, 255, ${opacity * 0.5})`,
                                zIndex: 10,
                                pointerEvents: 'none',
                            }}
                            className="animate-pulse_fast"
                        >
                            <div style={{
                                position: 'absolute', inset: '2px',
                                backgroundColor: `rgba(255, 255, 255, ${opacity * 0.6})`,
                                filter: 'blur(3px)',
                            }} />
                        </div>
                    );
                }
                break;
            case 'butter_slick':
                 effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.6, backgroundColor: `rgba(240, 230, 140, ${opacity * 0.6})`, borderRadius: '10px', zIndex: 2, pointerEvents: 'none' }} />;
                break;
            case 'radiation_trail':
                 effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.5, backgroundColor: `rgba(124, 252, 0, ${opacity * 0.5})`, borderRadius: '50%', filter: `blur(2px)`, zIndex: 2, pointerEvents: 'none' }} />;
                break;
            case 'explosion_aoe':
                const progress = Math.min(1, (Date.now() - effect.createdAt) / EXPLOSION_EFFECT_DURATION);
                const currentScale = 1 + progress * 0.5; 
                effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity, borderRadius: '50%', backgroundColor: `rgba(255, 69, 0, ${opacity * 0.7})`, boxShadow: `0 0 ${effect.width / 3}px ${effect.width / 5}px rgba(255, 165, 0, ${opacity * 0.6})`, transform: `scale(${currentScale})`, zIndex: 10, pointerEvents: 'none' }} />;
                break;
            case 'projectile_trail_particle':
                effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.8, backgroundColor: effect.color || `rgba(255, 255, 224, ${opacity * 0.8})`, borderRadius: '50%', zIndex: 18, pointerEvents: 'none' }} />;
                break;
            case 'vision_obscure_aoe':
                effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.65, backgroundColor: `rgba(10, 5, 20, ${opacity * 0.65})`, borderRadius: '50%', zIndex: 25, filter: `blur(3px)`, pointerEvents: 'none' }} />;
                break;
            case 'gravity_well_aoe':
                effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.7, border: `3px dashed rgba(100, 100, 255, ${opacity * 0.7})`, borderRadius: '50%', zIndex: 3, animation: 'spin 2s linear infinite', pointerEvents: 'none' }} />;
                break;
            case 'healing_beam':
                const sourceX = effect.x; 
                const sourceY = effect.y; 
                const targetX = effect.width; 
                const targetY = effect.height; 
                const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
                const distance = Math.hypot(targetX - sourceX, targetY - sourceY);
                effectVisual = <div key={key} style={{ position: 'absolute', left: sourceX, top: sourceY, width: distance, height: '4px', backgroundColor: effect.color || 'rgba(50,255,50,0.6)', transform: `rotate(${angle}deg)`, transformOrigin: '0 50%', zIndex: 7, opacity: opacity, pointerEvents: 'none' }} />;
                break;
            case 'meteor_impact_warning':
                 effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: getVisualGroundYAtX(effect.x + effect.width/2, mainGroundVisualNodesRef.current) - effect.height - 2, width: effect.width, height: effect.height, backgroundColor: `rgba(255,0,0, ${opacity*0.3})`, border: `2px dashed rgba(255,0,0, ${opacity*0.7})`, borderRadius: '50%', zIndex: 4, pointerEvents: 'none'}} />;
                break;
             case 'meteor_impact_aoe': 
                const meteorProgress = Math.min(1, (Date.now() - effect.createdAt) / (EXPLOSION_EFFECT_DURATION * 1.5));
                const meteorScale = 1 + meteorProgress * 0.7;
                effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity, borderRadius: '50%', backgroundColor: `rgba(255, 100, 0, ${opacity * 0.8})`, boxShadow: `0 0 ${effect.width / 2}px ${effect.width / 3}px rgba(255, 165, 0, ${opacity * 0.7})`, transform: `scale(${meteorScale})`, zIndex: 11, pointerEvents: 'none' }} />;
                break;
        }
        return effectVisual;
      })}

      <PlayerComponent player={player} /> 
      {enemies.map(enemy => <EnemyComponent key={enemy.id} enemy={enemy} />)} 
      {playerProjectiles.map(proj => <ProjectileComponent key={proj.id} projectile={proj} />)} 
      {enemyProjectilesData.map(proj => <ProjectileComponent key={proj.id} projectile={proj} />)} 
      {healingOrbs.map(orb => <HealingOrbComponent key={orb.id} orb={orb} />)} 
      {entropicFragments.map(frag => (
          <div key={frag.id} className="absolute rounded-full animate-pulse" style={{
              left: frag.x, top: frag.y, width: frag.width, height: frag.height,
              backgroundColor: 'rgba(128, 222, 234, 0.8)', 
              border: '1px solid rgba(77, 208, 225, 1)',
              boxShadow: '0 0 5px rgba(128, 222, 234, 0.7)',
              zIndex: 8,
          }} />
      ))}


      {floatingTexts.map(ft => (
        <div
            key={ft.id}
            className={`absolute font-bold pointer-events-none transition-opacity duration-500 ease-out ${ft.isCrit ? 'text-yellow-400 scale-125' : 'text-white'}`}
            style={{
                left: ft.x, top: ft.y, transform: `translateY(${(Date.now() - ft.timestamp) / -10}px) translateX(-50%)`, 
                opacity: Math.max(0, 1 - (Date.now() - ft.timestamp) / ft.duration), zIndex: 50,
                fontSize: `${ft.size || (ft.isCrit ? 16 : 14)}px`, 
                color: ft.color, 
                textShadow: ft.isCrit ? '0 0 5px #000' : (ft.text !== '.' ? '0 0 3px #000' : 'none'), 
            }}
        >
            {ft.text}
        </div>
      ))}

      <Hud
        playerStats={player.stats} gameTime={gameTime} waveNumber={waveNumber}
        enemiesDefeatedInWave={enemiesDefeatedThisWave} enemiesRequiredInWave={enemiesRequiredForWave}
        bossEnemy={currentBoss}
        activeEvent={activeDynamicEvent}
      />
      {gameStatus === GameStatus.Paused && currentUpgradeChoices.length > 0 && (
        <UpgradeModal upgrades={currentUpgradeChoices} onSelectUpgrade={handleSelectUpgrade} playerStats={player.stats} onRerollUpgrades={handleRerollUpgrades} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse_custom { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse_fast { animation: pulse_custom 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}}/>
    </div>
  );
};

export default GameView;
