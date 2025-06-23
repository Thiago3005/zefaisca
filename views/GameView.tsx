
import React, { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import {
  GameStatus, Player, Enemy, Projectile,
  HealingOrb, Upgrade, FloatingText, Rarity, Staff, Accessory,
  TemporaryEffect, ProjectileVisualType, EnemyType, Platform, KeysPressed, PlayerStats,
  GrassBlade, TemporaryEffectType, EntropicFragment, ActiveDynamicEvent, SoundEffectKey, Point, GameState, GameAction
} from '../types';
import { gameReducer, createInitialState } from '../gameLogic/gameReducer';
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
  GRASS_COLORS, GRASS_BEND_ANGLE, GRASS_BEND_RECOVERY_SPEED, GRASS_PLAYER_INTERACTION_RADIUS, GRASS_WIND_STRENGTH, GRASS_WIND_SPEED, 
  SLIME_ANIMATION_CONFIG, ENTROPIC_FRAGMENT_SIZE, ENTROPIC_FRAGMENT_DURATION, ENTROPIC_FRAGMENT_DROP_CHANCE, ORB_GRAVITY, ORB_INITIAL_POP_VELOCITY,
  METEOR_SHOWER_EVENT_DURATION, METEOR_SPAWN_INTERVAL, METEOR_WARNING_DURATION, METEOR_IMPACT_RADIUS, METEOR_IMPACT_DAMAGE,
  BOSS_STATS, BOSS_PROJECTILE_SPEED
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

import { getVisualGroundYAtX } from '../gameLogic/orbLogic'; 
import { createNewTemporaryEffect } from '../gameLogic/effectsLogic'; // Only createNew, update is in reducer/GameView

const MAX_FLOATING_TEXTS = 50;
const MAX_TEMP_EFFECTS = 30;

interface GameViewProps {
  onGameOver: (score: number, level: number) => void;
  isEffectivelyPlaying: boolean;
  selectedStaff: Staff;
  selectedAccessory: Accessory;
}

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
  const mainGroundVisualNodesRef = useRef(mainGroundVisualNodes); // Keep ref for passing to functions
  useEffect(() => { mainGroundVisualNodesRef.current = mainGroundVisualNodes; }, [mainGroundVisualNodes]);

  const [gameState, dispatch] = useReducer(gameReducer, createInitialState(selectedStaff, selectedAccessory, mainGroundVisualNodes));

  const [grassBlades, setGrassBlades] = useState<GrassBlade[]>([]);
  const [windTime, setWindTime] = useState(0); 

  // Object pooling for FloatingTexts
  const [activeFloatingTexts, setActiveFloatingTexts] = useState<FloatingText[]>([]);
  const floatingTextPool = useRef<FloatingText[]>([]);
  
  // Object pooling for TemporaryEffects
  const [activeTemporaryEffects, setActiveTemporaryEffects] = useState<TemporaryEffect[]>([]);
  const temporaryEffectPool = useRef<TemporaryEffect[]>([]);


  const [keysPressed, setKeysPressed] = useState<KeysPressed>({});
  const mousePosition = useRef<{ x: number; y: number }>({ x: GAME_WIDTH / 2, y: 0 });
  const lastPlayerShotTime = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const shakeTimeoutRef = useRef<number | null>(null);
  const lastFrameTime = useRef(performance.now());
  const gameLoopPaused = useRef(!isEffectivelyPlaying);

  useEffect(() => {
    gameLoopPaused.current = !isEffectivelyPlaying;
  }, [isEffectivelyPlaying]);


  // Initialize Grass
  useEffect(() => {
    const newGrassBlades: GrassBlade[] = [];
    const nodes = mainGroundVisualNodesRef.current;
    for (let i = 0; i < nodes.length -1; i++) {
        const node1 = nodes[i]; const node2 = nodes[i+1];
        const segmentLength = Math.hypot(node2.x - node1.x, node2.y - node1.y);
        const bladesInThisSegment = Math.max(1, Math.round(segmentLength / (GAME_WIDTH / (nodes.length-1)) * GRASS_BLADE_COUNT_PER_SEGMENT * (0.8 + Math.random() * 0.4)));
        for(let j=0; j < bladesInThisSegment; j++) {
            const t = (j + Math.random() * 0.8 - 0.4) / bladesInThisSegment;
            const baseX = node1.x + (node2.x - node1.x) * t;
            const y = getVisualGroundYAtX(baseX, nodes); 
            const initialAngle = (Math.random() - 0.5) * 15;
            const colorIndex = Math.floor(Math.random() * GRASS_COLORS.length);
            newGrassBlades.push({
                id: `grass-${i}-${j}`, baseX, x: baseX, y,
                height: GRASS_BLADE_BASE_HEIGHT + (Math.random() - 0.5) * GRASS_BLADE_HEIGHT_VARIATION,
                width: GRASS_BLADE_WIDTH * (0.8 + Math.random() * 0.4), initialAngle, currentAngle: initialAngle, targetAngle: initialAngle,
                lastBentTime: 0, color: GRASS_COLORS[colorIndex], swayOffset: Math.random() * Math.PI * 2, stiffness: 0.5 + Math.random() * 0.5,
            });
        }
    }
    setGrassBlades(newGrassBlades.sort((a,b) => a.baseX - b.baseX));
  }, [mainGroundVisualNodesRef]);


  const triggerScreenShake = useCallback((intensity: number, duration: number) => {
    if (gameAreaRef.current) {
        if (shakeTimeoutRef.current) {
            clearTimeout(shakeTimeoutRef.current);
            gameAreaRef.current.style.transform = '';
        }
        const startTime = performance.now();
        const shake = () => {
            const elapsedTime = performance.now() - startTime;
            if (elapsedTime < duration && gameAreaRef.current) {
                const x = (Math.random() - 0.5) * intensity * (1 - elapsedTime/duration); 
                const y = (Math.random() - 0.5) * intensity * (1 - elapsedTime/duration);
                gameAreaRef.current.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else if (gameAreaRef.current) {
                gameAreaRef.current.style.transform = '';
            }
        };
        requestAnimationFrame(shake);
    }
  }, []);

  // Effect to handle screen shake requests from reducer
  useEffect(() => {
    if (gameState.triggerScreenShake) {
      triggerScreenShake(gameState.triggerScreenShake.intensity, gameState.triggerScreenShake.duration);
    }
  }, [gameState.triggerScreenShake, triggerScreenShake]);


  const addFloatingTextOptimized = useCallback((data: Omit<FloatingText, 'id' | 'isActive' | 'timestamp'>) => {
    const now = Date.now();
    let textInstance = floatingTextPool.current.pop();
    if (textInstance) {
        textInstance.text = data.text;
        textInstance.x = data.x;
        textInstance.y = data.y;
        textInstance.color = data.color;
        textInstance.isCrit = data.isCrit;
        textInstance.vx = data.vx;
        textInstance.vy = data.vy;
        textInstance.size = data.size;
        textInstance.timestamp = now;
        textInstance.duration = data.duration || FLOATING_TEXT_DURATION;
        textInstance.isActive = true;
    } else {
        textInstance = {
            id: `ft-${now}-${Math.random()}`,
            timestamp: now,
            duration: data.duration || FLOATING_TEXT_DURATION,
            isActive: true,
            ...data,
        };
    }
    setActiveFloatingTexts(prev => [...prev, textInstance!]);
  }, []);

  const addTemporaryEffectOptimized = useCallback((data: Omit<TemporaryEffect, 'id' | 'createdAt' | 'hitEnemyIds' | 'isActive'>) => {
    const now = Date.now();
    let effectInstance = temporaryEffectPool.current.pop();
     if (effectInstance) {
        // Reset and update pooled instance
        Object.assign(effectInstance, data); // Quick way to copy properties
        effectInstance.createdAt = now;
        effectInstance.hitEnemyIds = new Set<string>();
        effectInstance.isActive = true;
    } else {
        effectInstance = createNewTemporaryEffect(data);
        effectInstance.isActive = true;
    }
    setActiveTemporaryEffects(prev => [...prev, effectInstance!]);
  }, []);
  
  // Process queued texts from reducer
  useEffect(() => {
    gameState.floatingTextsToAdd.forEach(ftData => addFloatingTextOptimized(ftData));
  }, [gameState.floatingTextsToAdd, addFloatingTextOptimized]);

  // Process queued temp effects from reducer
  useEffect(() => {
    gameState.tempEffectsToAdd.forEach(teData => addTemporaryEffectOptimized(teData));
  }, [gameState.tempEffectsToAdd, addTemporaryEffectOptimized]);


  // Game Loop
  useEffect(() => {
    let gameLoopId: number | undefined = undefined;

    if (!gameLoopPaused.current && !gameState.isGameOver && !gameState.shouldShowUpgradeModal) {
      gameLoopId = requestAnimationFrame(() => {
        const now = performance.now();
        const rawDelta = (now - lastFrameTime.current) / 1000;
        const delta = Math.max(0.008, Math.min(0.05, rawDelta)); 
        lastFrameTime.current = now;
        
        setWindTime(prev => prev + delta * GRASS_WIND_SPEED);

        // Update activeFloatingTexts
        setActiveFloatingTexts(prevTexts => {
            const stillActive: FloatingText[] = [];
            prevTexts.forEach(ft => {
                if (ft.isActive && now - ft.timestamp < ft.duration) {
                    ft.x = ft.vx ? ft.x + ft.vx * delta : ft.x;
                    ft.y = ft.vy ? ft.y + ft.vy * delta : ft.y - 30 * delta;
                    stillActive.push(ft);
                } else if (ft.isActive) {
                    ft.isActive = false; // Mark as inactive
                    if (floatingTextPool.current.length < MAX_FLOATING_TEXTS) {
                        floatingTextPool.current.push(ft);
                    }
                }
            });
            return stillActive;
        });

        // Update activeTemporaryEffects
        setActiveTemporaryEffects(prevEffects => {
            const stillActive: TemporaryEffect[] = [];
            prevEffects.forEach(eff => {
                if (eff.isActive && now - eff.createdAt < eff.duration) {
                    // Specific logic for meteor warning -> impact transition
                    if (eff.effectType === 'meteor_impact_warning' && now - eff.createdAt >= eff.duration) {
                        triggerScreenShake(6, 300);
                        audioManager.playSound('meteor_impact');
                        addTemporaryEffectOptimized({
                            x: eff.x, 
                            y: getVisualGroundYAtX(eff.x + eff.width/2, mainGroundVisualNodesRef.current) - METEOR_IMPACT_RADIUS, 
                            width: METEOR_IMPACT_RADIUS * 2, height: METEOR_IMPACT_RADIUS * 2,
                            effectType: 'meteor_impact_aoe',
                            duration: EXPLOSION_EFFECT_DURATION * 1.5,
                            damage: METEOR_IMPACT_DAMAGE,
                        });
                        eff.isActive = false; // Mark old warning as inactive
                    } else {
                       stillActive.push(eff);
                    }
                } else if (eff.isActive) {
                    eff.isActive = false;
                    if (temporaryEffectPool.current.length < MAX_TEMP_EFFECTS) {
                        temporaryEffectPool.current.push(eff);
                    }
                }
            });
            return stillActive.filter(eff => eff.isActive); // Ensure only active ones remain
        });


        // Handle shooting separately, as it relies on a ref for lastShotTime
        if (keysPressed['mouse0']) {
            const actualFireRate = gameState.player.stats.baseFireRate * (selectedStaff.fireRateModifier || 1) * (gameState.player.stats.coffeeBuff.active ? gameState.player.stats.coffeeBuff.fireRateMultiplier : 1);
            if (now - lastPlayerShotTime.current >= actualFireRate) {
                 dispatch({ type: 'PLAYER_SHOOT_ACTION', payload: { now, mousePosition: mousePosition.current, selectedStaff } });
                 lastPlayerShotTime.current = now; // Update ref here
            }
        }

        dispatch({ type: 'PROCESS_GAME_TICK', payload: { delta, now, keysPressed, mousePosition: mousePosition.current, selectedStaff, mainGroundVisualNodes: mainGroundVisualNodesRef.current } });

        setGrassBlades(prevBlades => prevBlades.map(blade => {
            let newAngle = blade.currentAngle; let targetAngle = blade.initialAngle;
            const windInfluence = Math.sin(windTime + blade.swayOffset) * GRASS_WIND_STRENGTH * (1 / blade.stiffness);
            targetAngle += windInfluence;
            const distToPlayer = Math.hypot(blade.baseX - (gameState.player.x + gameState.player.width / 2), blade.y - (gameState.player.y + gameState.player.height));
            if (distToPlayer < GRASS_PLAYER_INTERACTION_RADIUS && gameState.player.y + gameState.player.height > blade.y - blade.height) { 
                const bendDirection = (gameState.player.x + gameState.player.width / 2) > blade.baseX ? -1 : 1;
                const playerSpeedFactor = Math.max(0.3, Math.min(1, Math.abs(gameState.player.vx || 0) / (gameState.player.stats.speed * 0.5))); 
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
      });
    } else {
      lastFrameTime.current = performance.now(); // Reset lastFrameTime when paused
    }

    return () => {
      if (gameLoopId !== undefined) cancelAnimationFrame(gameLoopId);
      if (shakeTimeoutRef.current) { 
        clearTimeout(shakeTimeoutRef.current);
        if (gameAreaRef.current) gameAreaRef.current.style.transform = '';
      }
    };
  }, [
      gameState, // Main dependency for reducer-driven updates
      isEffectivelyPlaying, keysPressed, 
      selectedStaff, // Pass to reducer for shooting
      windTime, // Local state for grass
      addFloatingTextOptimized, addTemporaryEffectOptimized, triggerScreenShake // Callbacks
  ]);

  useEffect(() => {
    if (gameState.isGameOver) {
      onGameOver(gameState.gameOverScore, gameState.gameOverLevel);
      // Stop sounds specific to game over that reducer might not handle directly
      audioManager.stopSound('boss_attack_beam_fire'); 
      audioManager.stopSound('sentinela_heal_beam_loop');
      gameState.enemies.forEach(enemy => {
        if (enemy.type === 'sentinela_reparadora') {
            audioManager.stopSound(`heal_beam_${enemy.id}`);
        }
      });
    }
  }, [gameState.isGameOver, gameState.gameOverScore, gameState.gameOverLevel, onGameOver, gameState.enemies]);

  // Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ') e.preventDefault();
        const key = e.key.toLowerCase();
        if ((key === 'w' || key === 'arrowup' || key === ' ') && !keysPressed['jump_action_pending']) {
            setKeysPressed(prev => ({ ...prev, ['jump_action_pending']: true, [key]: true }));
            if (!gameLoopPaused.current) dispatch({ type: 'PLAYER_JUMP_ACTION' });
        } else {
            setKeysPressed(prev => ({ ...prev, [key]: true }));
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup' || key === ' ') {
        setKeysPressed(prev => ({ ...prev, ['jump_action_pending']: false, [key]: false }));
      } else {
        setKeysPressed(prev => ({ ...prev, [key]: false }));
      }
    };
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
  }, [keysPressed]); // Re-add keysPressed to ensure jump_action_pending is captured
  
  const mainGroundPathData = useMemo(() => {
    return generateSmoothGroundPath(mainGroundVisualNodesRef.current, GROUND_SMOOTHING_TENSION);
  }, [mainGroundVisualNodesRef]);

  const handleSelectUpgrade = useCallback((upgrade: Upgrade) => {
    dispatch({ type: 'SELECT_UPGRADE', payload: upgrade });
    dispatch({ type: 'DISMISS_UPGRADE_MODAL_AND_START_NEXT_WAVE' });
  }, []);

  const handleRerollUpgrades = useCallback(() => {
    dispatch({ type: 'REROLL_UPGRADES' });
  }, []);

  if (!isEffectivelyPlaying && !gameState.isGameOver && !gameState.shouldShowUpgradeModal) return null;
  const currentBoss = gameState.enemies.find(e => e.isBoss && e.hp > 0) || null;

  return (
    <div
      ref={gameAreaRef}
      className="relative bg-slate-800 cursor-crosshair overflow-hidden shadow-2xl border-2 border-slate-700 rounded-lg"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} 
    >
      <StarfieldBackground />
      <ParallaxBackground cameraX={gameState.player.x} />

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
                key={blade.id} x={blade.x - blade.width / 2} y={blade.y - blade.height}
                width={blade.width} height={blade.height} fill={blade.color}
                style={{ transformOrigin: `${blade.x}px ${blade.y}px`, transform: `rotate(${blade.currentAngle}deg)`, transition: 'transform 0.1s linear' }}/>
        ))}
        <path d={mainGroundPathData.stroke} stroke={'transparent'} strokeWidth={PLATFORM_STROKE_THICKNESS} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      {activeTemporaryEffects.map(effect => { 
        if (!effect.isActive) return null;
        let effectVisual = null; const key = effect.id;
        const opacity = Math.max(0, 1 - (Date.now() - effect.createdAt) / effect.duration);
        
        switch (effect.effectType) {
            case 'lightning_aoe':
                const lightningStats = gameState.player.stats.lightningStrikes;
                const warningRadiusActual = lightningStats.radius;
                const isWarningPhase = Date.now() - effect.createdAt < LIGHTNING_WARN_DURATION;
                if (isWarningPhase) {
                    const warningCenterX = effect.x + effect.width / 2;
                    const warningCenterY = getVisualGroundYAtX(warningCenterX, mainGroundVisualNodesRef.current);
                    effectVisual = (<div key={`${key}-warn`} style={{ position: 'absolute', left: warningCenterX - warningRadiusActual, top: warningCenterY - warningRadiusActual, width: warningRadiusActual * 2, height: warningRadiusActual * 2, borderRadius: '50%', border: `3px dashed rgba(255, 255, 0, ${opacity})`, backgroundColor: `rgba(255, 255, 0, ${opacity * 0.1})`, zIndex: 4 }}/>);
                } else {
                    effectVisual = (<div key={key} style={{ position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, backgroundColor: `rgba(255, 255, 180, ${opacity * 0.85})`, boxShadow: `0 0 15px 7px rgba(255, 255, 100, ${opacity * 0.7}), inset 0 0 10px 2px rgba(255, 255, 255, ${opacity * 0.5})`, zIndex: 10 }} className="animate-pulse_fast"><div style={{ position: 'absolute', inset: '2px', backgroundColor: `rgba(255, 255, 255, ${opacity * 0.6})`, filter: 'blur(3px)', }} /></div>);
                }
                break;
            case 'butter_slick': effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.6, backgroundColor: `rgba(240, 230, 140, ${opacity * 0.6})`, borderRadius: '10px', zIndex: 2 }} />; break;
            case 'radiation_trail': effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.5, backgroundColor: `rgba(124, 252, 0, ${opacity * 0.5})`, borderRadius: '50%', filter: `blur(2px)`, zIndex: 2 }} />; break;
            case 'explosion_aoe': const progress = Math.min(1, (Date.now() - effect.createdAt) / EXPLOSION_EFFECT_DURATION); const currentScale = 1 + progress * 0.5; effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity, borderRadius: '50%', backgroundColor: `rgba(255, 69, 0, ${opacity * 0.7})`, boxShadow: `0 0 ${effect.width / 3}px ${effect.width / 5}px rgba(255, 165, 0, ${opacity * 0.6})`, transform: `scale(${currentScale})`, zIndex: 10 }} />; break;
            case 'projectile_trail_particle': effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.8, backgroundColor: effect.color || `rgba(255, 255, 224, ${opacity * 0.8})`, borderRadius: '50%', zIndex: 18 }} />; break;
            case 'vision_obscure_aoe': effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.65, backgroundColor: `rgba(10, 5, 20, ${opacity * 0.65})`, borderRadius: '50%', zIndex: 25, filter: `blur(3px)`}} />; break;
            case 'gravity_well_aoe': effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity: opacity * 0.7, border: `3px dashed rgba(100, 100, 255, ${opacity * 0.7})`, borderRadius: '50%', zIndex: 3, animation: 'spin 2s linear infinite' }} />; break;
            case 'healing_beam': const sourceX = effect.x; const sourceY = effect.y; const targetX = effect.width; const targetY = effect.height; const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI; const distance = Math.hypot(targetX - sourceX, targetY - sourceY); effectVisual = <div key={key} style={{ position: 'absolute', left: sourceX, top: sourceY, width: distance, height: '4px', backgroundColor: effect.color || 'rgba(50,255,50,0.6)', transform: `rotate(${angle}deg)`, transformOrigin: '0 50%', zIndex: 7, opacity }} />; break;
            case 'meteor_impact_warning': effectVisual = <div key={key} style={{ position: 'absolute', left: effect.x, top: getVisualGroundYAtX(effect.x + effect.width/2, mainGroundVisualNodesRef.current) - effect.height - 2, width: effect.width, height: effect.height, backgroundColor: `rgba(255,0,0, ${opacity*0.3})`, border: `2px dashed rgba(255,0,0, ${opacity*0.7})`, borderRadius: '50%', zIndex: 4}} />; break;
            case 'meteor_impact_aoe': const meteorProgress = Math.min(1, (Date.now() - effect.createdAt) / (EXPLOSION_EFFECT_DURATION * 1.5)); const meteorScale = 1 + meteorProgress * 0.7; effectVisual = <div key={key} style={{position: 'absolute', left: effect.x, top: effect.y, width: effect.width, height: effect.height, opacity, borderRadius: '50%', backgroundColor: `rgba(255, 100, 0, ${opacity * 0.8})`, boxShadow: `0 0 ${effect.width / 2}px ${effect.width / 3}px rgba(255, 165, 0, ${opacity * 0.7})`, transform: `scale(${meteorScale})`, zIndex: 11 }} />; break;
        }
        return effectVisual;
      })}

      <PlayerComponent player={gameState.player} /> 
      {gameState.enemies.map(enemy => enemy.hp > 0 || (enemy.type === 'slime' && enemy.isDying) ? <EnemyComponent key={enemy.id} enemy={enemy} /> : null)} 
      {gameState.playerProjectiles.map(proj => <ProjectileComponent key={proj.id} projectile={proj} />)} 
      {gameState.enemyProjectiles.map(proj => <ProjectileComponent key={proj.id} projectile={proj} />)} 
      {gameState.healingOrbs.map(orb => <HealingOrbComponent key={orb.id} orb={orb} />)} 
      {gameState.entropicFragments.map(frag => (
          <div key={frag.id} className="absolute rounded-full animate-pulse" style={{
              left: frag.x, top: frag.y, width: frag.width, height: frag.height,
              backgroundColor: 'rgba(128, 222, 234, 0.8)', border: '1px solid rgba(77, 208, 225, 1)',
              boxShadow: '0 0 5px rgba(128, 222, 234, 0.7)', zIndex: 8,
          }} />
      ))}

      {activeFloatingTexts.map(ft => ft.isActive ? (
        <div
            key={ft.id}
            className={`absolute font-bold pointer-events-none transition-opacity duration-500 ease-out ${ft.isCrit ? 'text-yellow-400 scale-125' : 'text-white'}`}
            style={{
                left: ft.x, top: ft.y, transform: `translateY(${(Date.now() - ft.timestamp) / -10}px) translateX(-50%)`, 
                opacity: Math.max(0, 1 - (Date.now() - ft.timestamp) / ft.duration), zIndex: 50,
                fontSize: `${ft.size || (ft.isCrit ? 16 : 14)}px`, color: ft.color, 
                textShadow: ft.isCrit ? '0 0 5px #000' : (ft.text !== '.' ? '0 0 3px #000' : 'none'), 
            }}
        >
            {ft.text}
        </div>
      ): null)}

      <Hud
        playerStats={gameState.player.stats} gameTime={gameState.gameTime} waveNumber={gameState.waveNumber}
        enemiesDefeatedInWave={gameState.enemiesDefeatedThisWave} enemiesRequiredInWave={gameState.enemiesRequiredForWave}
        bossEnemy={currentBoss}
        activeEvent={gameState.activeDynamicEvent}
      />
      {gameState.shouldShowUpgradeModal && gameState.currentUpgradeChoices.length > 0 && (
        <UpgradeModal upgrades={gameState.currentUpgradeChoices} onSelectUpgrade={handleSelectUpgrade} playerStats={gameState.player.stats} onRerollUpgrades={handleRerollUpgrades} />
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
