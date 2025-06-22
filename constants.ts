
import { PlayerStats, Upgrade, Rarity, Staff, Accessory, Platform, EnemyType, StackGrant } from './types';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PLAYER_GRAVITY = 2200;
export const PLAYER_JUMP_FORCE = 750;
export const PLAYER_MAX_JUMPS_DEFAULT = 1;

// Sprite Sheet and Animation Constants
export const SPRITE_SHEET_URL = 'Assets/AnimationSheet_Character.png';
export const SPRITE_FRAME_WIDTH = 32;
export const SPRITE_FRAME_HEIGHT = 32;

export const PLAYER_SPRITE_DISPLAY_WIDTH = 48;
export const PLAYER_SPRITE_DISPLAY_HEIGHT = 48;

export const SPRITE_SHEET_TOTAL_COLUMNS_ASSUMED = 8;
export const SPRITE_SHEET_TOTAL_ROWS_ASSUMED = 9;

export const PLAYER_ANIMATION_CONFIG = {
  idle: {
    frames: 1,
    row: 0,
    frameRate: 150,
  },
  walk: {
    frames: 4,
    row: 1,
    frameRate: 100,
  },
  jump_pose: {
    frames: 1,
    row: 2,
    frameRate: 1000,
  }
};

export const SLIME_SPRITE_NATIVE_WIDTH = 24;
export const SLIME_SPRITE_NATIVE_HEIGHT = 24;
export const SLIME_DISPLAY_WIDTH = 24;
export const SLIME_DISPLAY_HEIGHT = 24;

export const SLIME_ANIMATION_CONFIG = {
  idle: {
    spriteSheetUrl: 'Assets/slime_idle.png',
    frames: 4,
    frameRate: 200, // ms per frame
    totalColumns: 4,
    loops: true,
  },
  run: {
    spriteSheetUrl: 'Assets/slime_run.png',
    frames: 6,
    frameRate: 150,
    totalColumns: 6,
    loops: true,
  },
  die: {
    spriteSheetUrl: 'Assets/slime_die.png',
    frames: 5,
    frameRate: 180,
    totalColumns: 5,
    loops: false,
  }
};

// New Enemy Type Constants
export const SOMBRA_OFUSCANTE_WIDTH = 50;
export const SOMBRA_OFUSCANTE_HEIGHT = 50;
export const SOMBRA_OFUSCANTE_HP_BASE = 70;
export const SOMBRA_OFUSCANTE_SPEED = 80;
export const SOMBRA_OFUSCANTE_ABILITY_COOLDOWN = 8000; // ms
export const SOMBRA_OFUSCANTE_VISION_OBSCURE_RADIUS = GAME_WIDTH * 0.4;
export const SOMBRA_OFUSCANTE_VISION_OBSCURE_DURATION = 4000; // ms

export const TECELAO_GRAVITACIONAL_WIDTH = 60;
export const TECELAO_GRAVITACIONAL_HEIGHT = 60;
export const TECELAO_GRAVITACIONAL_HP_BASE = 120;
export const TECELAO_GRAVITACIONAL_SPEED = 60;
export const TECELAO_GRAVITACIONAL_ABILITY_COOLDOWN = 10000; // ms
export const TECELAO_GRAVITACIONAL_WELL_RADIUS = 150;
export const TECELAO_GRAVITACIONAL_WELL_DURATION = 5000; // ms
export const TECELAO_GRAVITACIONAL_WELL_PULL_FORCE = 250; // arbitrary unit

export const SENTINELA_REPARADORA_WIDTH = 45;
export const SENTINELA_REPARADORA_HEIGHT = 45;
export const SENTINELA_REPARADORA_HP_BASE = 90;
export const SENTINELA_REPARADORA_SPEED = 70;
export const SENTINELA_REPARADORA_HEAL_AMOUNT = 5; // per pulse
export const SENTINELA_REPARADORA_HEAL_PULSE_INTERVAL = 1000; // ms
export const SENTINELA_REPARADORA_HEAL_RANGE = 250;
export const SENTINELA_REPARADORA_BEAM_DURATION = SENTINELA_REPARADORA_HEAL_PULSE_INTERVAL + 100;

export const PLAYER_INVULNERABILITY_DURATION = 1000; // base duration

export const INITIAL_PLAYER_STATS: PlayerStats = {
  level: 1,
  maxHp: 100,
  currentHp: 100,
  defense: 0,
  speed: 300,
  maxJumps: PLAYER_MAX_JUMPS_DEFAULT,
  baseProjectileDamage: 10,
  baseFireRate: 450,
  critChance: 0.05,
  critMultiplier: 1.5,
  lifesteal: 0,
  healOrbChance: 0.05,
  bodyDamage: 0,
  canApplyWound: false,
  upgradeChoices: 3,
  ownedUpgrades: {},
  rerollsAvailable: 0,
  invulnerabilityDuration: PLAYER_INVULNERABILITY_DURATION,

  lightningStrikes: {
    enabled: false,
    damage: 0,
    cooldown: 5000,
    radius: 50,
    strikesPerCycle: 0,
    lastCycleTime: 0,
  },
  chainExplosion: {
    enabled: false,
    level: 0,
    baseDamage: 0,
    baseRadius: 0,
    fragmentDamageMultiplier: 0.3,
    fragmentsPerExplosion: 3,
    maxChainDepth: 3,
  },
  reflectProjectile: {
    enabled: false,
    chance: 0,
    damageMultiplier: 1,
  },
  slickTrailMaker: {
    enabled: false,
    slowAmount: 0.5,
    duration: 2000,
  },
  atomicChicken: {
    enabled: false,
    radiationDamage: 1,
    bounceExplosionRadius: 30,
    bounceExplosionDamage: 5,
  },
  coffeeBuff: {
    active: false,
    durationLeft: 0,
    speedMultiplier: 1.2,
    fireRateMultiplier: 0.8,
  },

  projectilePierceCount: 0,
  dodgeChance: 0,
  playerSizeMultiplier: 1,
  luckFactor: 0,
  shield: {
    enabled: false,
    active: false,
    cooldownActive: false,
    cooldownTimeLeft: 0,
    maxCooldown: 15000,
  },
  slowOnHitChance: 0,
  slowOnHitDuration: 1000,
  slowOnHitPower: 0.2,
  ghostShotChance: 0,
  enemyShrapnel: {
    enabled: false,
    count: 2,
    damageMultiplier: 0.25,
  },
  collectedEntropicFragments: 0,
  entropicBuffDuration: 0,
  activeStaffSoulEffect: undefined,

  // Initialize new stats for chaotic upgrades
  absorbentHealOnInvulnHit: false,
  avenger: { enabled: false, cooldownWavesLeft: 0, lastActivationWave: 0 },
  woundTickRateMultiplier: 1,
  bodyPushbackForce: 0,
  bunker: { currentBonusFlatArmor: 0, secondsStationary: 0 },
  burningManAura: { enabled: false, damage: 0, radius: 0, tickInterval: 2000, lastTickTime: 0 },
  cometLanding: { enabled: false, damagePerYPixel: 0.1, maxDamage: 200 },
  desperateHealOnWaveStart: false,
  wisps: { enabled: false, count: 0, damageFactor: 0.5, fireRateFactor: 1, enchanterModeActive: false },
  exorcistSoulBeam: { enabled: false, damage: 20 },
  maxSlowPower: 0.8, // Default max slow from Cold upgrade is 80%
  freezerInstaKillChance: 0,
  enemyProjectileMissChance: 0,
  hoarderCharges: { current: 0, bonusDamagePerCharge: 5 },
  marksmanFirstHitCritConsumed: false,
  nerdRandomCommonCardPerWave: false,
  pacManBonusPerPassThrough: 1,
  plagueAura: { enabled: false, percentHPDamagePerTick: 0.0025, tickInterval: 250, lastTickTime: 0 }, // 1% HP per sec (0.25% per 250ms)
  protectorShards: { enabled: false, count: 5, damageFactor: 0.3 },
  // RAM Destroyer modifies existing enemyShrapnel stats
  sadisticThorns: { enabled: false, reflectFraction: 0 },
  speculatorSuperCrit: { chanceFromCrit: 0, multiplier: 2 },
  streamerBeam: { enabled: false, dpsPerAttackSpeedStatUnit: 50 },
  projectileSizeFactor: 1,
  whiteDwarfBlackHole: { enabled: false, duration: 3000, pullForce: 150, radius: 100 },
  
  // Friction and Anti-Aircraft
  frictionStats: {
    enabled: false,
    distancePerProjectile: 50, // pixels representing 1 meter
    projectilesPerActivation: 0,
    projectileDamage: 0,
    explosionRadius: 50, // Default base radius
    distanceRunSinceLastActivation: 0,
  },
  antiAircraftFrictionRadiusMultiplier: 1,
};

export const GROUND_Y_LEVEL_VALUES = [
  GAME_HEIGHT - 70,
  GAME_HEIGHT - 90,
  GAME_HEIGHT - 110,
];

export const GROUND_NODE_POINTS: Array<{ xFraction: number, yLevel: number }> = [
  { xFraction: 0,    yLevel: 0 },
  { xFraction: 0.15, yLevel: 0 },
  { xFraction: 0.25, yLevel: 1 },
  { xFraction: 0.35, yLevel: 1 },
  { xFraction: 0.45, yLevel: 0 },
  { xFraction: 0.55, yLevel: 2 },
  { xFraction: 0.65, yLevel: 0 },
  { xFraction: 0.75, yLevel: 1 },
  { xFraction: 0.85, yLevel: 1 },
  { xFraction: 1.0,  yLevel: 0 },
];

const lowestGroundY = Math.max(...GROUND_Y_LEVEL_VALUES);
export const PLATFORM_COLLISION_BASE_Y = lowestGroundY;
export const PLATFORM_COLLISION_BASE_HEIGHT = GAME_HEIGHT - lowestGroundY;

export const PLATFORMS: Platform[] = [
  {
    id: 'main_ground_collision_base',
    x: 0,
    y: PLATFORM_COLLISION_BASE_Y,
    width: GAME_WIDTH,
    height: PLATFORM_COLLISION_BASE_HEIGHT,
    type: 'ground'
  },
];


export const STAVES: Staff[] = [
  {
    id: 'cajado_mago',
    name: '🪄 Cajado de Mago',
    emoji: '🪄',
    description: 'Dispara um projétil mágico em linha reta. O feijão com arroz dos magos.',
    projectileVisual: 'default_magic',
  },
  {
    id: 'chinelo_mamae',
    name: '🩴 Chinelo Teleguiado da Mamãe',
    emoji: '🩴',
    description: 'Arremessa um chinelo teleguiado que causa alto dano. Mais lento, mas certeiro.',
    projectileVisual: 'chinelo',
    damageModifier: 1.8,
    fireRateModifier: 1.5,
    projectileSpeedModifier: 0.7,
    homing: true,
  },
  {
    id: 'canhao_pipoca',
    name: '🍿 Canhão de Pipoca',
    emoji: '🍿',
    description: 'Dispara caroços de pipoca que explodem em múltiplos projéteis. Chuva de milho!',
    projectileVisual: 'pipoca_kernel',
    fireRateModifier: 1.2,
    damageModifier: 0.4,
    shotgunPellets: 5,
    projectileSpeedModifier: 1.1,
  },
  {
    id: 'rodo_magico',
    name: '🧹 Rodo Mágico Limpa-Tudo',
    emoji: '🧹',
    description: 'Lança Bolas de Sabão que estouram causando dano em área. Limpeza profunda!',
    projectileVisual: 'soap_bubble',
    damageModifier: 1.0,
    fireRateModifier: 1.1,
    explodesOnImpact: true,
    explosionRadius: 70,
  },
  {
    id: 'desentupidor_celestial',
    name: '🪠 Desentupidor Celestial',
    emoji: '🪠',
    description: 'Lança um desentupidor que gruda no inimigo, causando constrangimento e paralisia.',
    projectileVisual: 'plunger',
    damageModifier: 0.5,
    fireRateModifier: 1.3,
    stunChance: 0.75,
    stunDuration: 1500,
  },
  {
    id: 'pantufa_vovo',
    name: '👟 Pantufa do Vovô',
    emoji: '👟',
    description: 'Uma pantufa tão poderosa que silencia. Dano massivo, mas leeeenta. 20% chance de silenciar.',
    projectileVisual: 'slipper',
    damageModifier: 2.5,
    fireRateModifier: 2.0,
    projectileSpeedModifier: 0.6,
    silenceChance: 0.2,
    silenceDuration: 2000,
  },
  {
    id: 'galinha_macumba',
    name: '🐔 Galinha de Macumba',
    emoji: '🐔',
    description: 'Arremessa uma galinha consagrada que quica e amaldiçoa (máx 5 quicadas). 50% chance de mandinga!',
    projectileVisual: 'chicken',
    damageModifier: 0.8,
    fireRateModifier: 1.4,
    bounces: 5,
    curseChance: 0.5,
  },
];

export const ACCESSORIES: Accessory[] = [
  {
    id: 'oculos_pardal',
    name: '🤓 Óculos de Professor Pardal',
    emoji: '🤓',
    description: 'Visão de gênio! +1 escolha de upgrade ao subir de nível (efeito único no início).',
    applyStats: (stats) => {
      const newStats = { ...stats };
      newStats.upgradeChoices = (newStats.upgradeChoices || 3) + 1;
      return newStats;
    }
  },
  {
    id: 'capacete_obra',
    name: '👷 Capacete de Obra Celestial',
    emoji: '👷',
    description: 'Segurança em primeiro lugar! +15% Defesa, mas -10% Velocidade de Movimento.',
    applyStats: (stats) => {
      const newStats = { ...stats };
      newStats.defense = Math.min(0.9, (newStats.defense || 0) + 0.15);
      newStats.speed = (newStats.speed || INITIAL_PLAYER_STATS.speed) * 0.90;
      return newStats;
    }
  },
  {
    id: 'mola_pes',
    name: '👟💨 Mola Maluca nos Pés',
    emoji: '💨',
    description: 'Saltitante! +10% Velocidade de Movimento, mas -5% Dano de Projétil (meio desajeitado).',
    applyStats: (stats) => {
      const newStats = { ...stats };
      newStats.speed = (newStats.speed || INITIAL_PLAYER_STATS.speed) * 1.10;
      newStats.baseProjectileDamage = (newStats.baseProjectileDamage || INITIAL_PLAYER_STATS.baseProjectileDamage) * 0.95;
      return newStats;
    }
  },
  {
    id: 'amuleto_meia_boca',
    name: '🍀 Amuleto da Sorte Meia-Boca',
    emoji: '🍀',
    description: 'Um trevo de Chernobyl. +15% de Sorte (afeta raridade dos upgrades).',
    applyStats: (stats) => {
      const newStats = { ...stats };
      newStats.luckFactor = (newStats.luckFactor || 0) + 0.15;
      return newStats;
    }
  },
  {
    id: 'pimenta_cosmica',
    name: '🌶️ Pimenta Malagueta Cósmica',
    emoji: '🌶️',
    description: 'Ardência celestial! Inimigos têm +10% HP e Dano, mas EXP por inimigo derrotado é +15% (não afeta upgrades).',
    applyStats: (stats) => {
      return stats; // No direct stat change, handled by game logic
    }
  },
  {
    id: 'cartola_vigarista',
    name: '🎩 Cartola de Mágico Vigarista',
    emoji: '🎩',
    description: 'Truques na manga! Permite 3 re-rolagens de upgrades por jogo. Não entra no Ranking.',
    applyStats: (stats) => {
      const newStats = { ...stats };
      newStats.rerollsAvailable = 3;
      return newStats;
    }
  }
];

export const ENTROPIC_FRAGMENT_SIZE = 12;
export const ENTROPIC_FRAGMENT_DURATION = 7000; // ms
export const ENTROPIC_FRAGMENT_DROP_CHANCE = 0.3; // 30% chance from non-boss enemies
export const ENTROPIC_FRAGMENT_BUFF_PER_FRAGMENT = 0.02; // e.g., 2% damage increase
export const ENTROPIC_FRAGMENT_BUFF_DURATION = 5000; // ms, refreshes on collect
export const MAX_ENTROPIC_FRAGMENTS_BUFF_STACKS = 10; // Max 20% buff

export const PIPOCA_SOUL_FRAGMENT_COUNT = 2;
export const PIPOCA_SOUL_FRAGMENT_DAMAGE_MULTIPLIER = 0.4;
export const PIPOCA_SOUL_FRAGMENT_SPEED_MULTIPLIER = 1.3;
export const PIPOCA_SOUL_FRAGMENT_SIZE = 6;


// Helper function to apply stackable upgrades
const applyStackedUpgrade = (stats: PlayerStats, upgradeId: string, count: number) => {
  const upgradeToApply = ALL_UPGRADES_DEFINITIONS.find(u => u.id === upgradeId);
  if (upgradeToApply) {
    for (let i = 0; i < count; i++) {
      upgradeToApply.apply(stats, (stats.ownedUpgrades[upgradeId] || 0) + i + 1);
    }
    stats.ownedUpgrades[upgradeId] = (stats.ownedUpgrades[upgradeId] || 0) + count;
  }
};


const ALL_UPGRADES_DEFINITIONS: Upgrade[] = [
  // Common
  { id: 'catalyst', name: 'Catalisador', desc: 'Dano do Projétil +2', rarity: Rarity.Common, icon: '⚡', color: '#FFF', apply: (stats) => { stats.baseProjectileDamage += 2; }, maxLevel: 20 },
  { id: 'eyesight', name: 'Visão Aguçada', desc: 'Chance de Crítico +5%', rarity: Rarity.Common, icon: '🎯', color: '#FFF', apply: (stats) => { stats.critChance = Math.min(1, stats.critChance + 0.05); }, maxLevel: 10 },
  { id: 'growth', name: 'Crescimento', desc: 'HP Máx. +10', rarity: Rarity.Common, icon: '💪', color: '#FFF', apply: (stats) => { stats.maxHp += 10; stats.currentHp += 10; }, maxLevel: 15 },
  { id: 'impulse', name: 'Impulso', desc: 'Altura do Pulo +30%', rarity: Rarity.Common, icon: '🤸', color: '#FFF', apply: (stats) => { /* Jump force is constant, implies other buff or more jumps */ }, maxLevel: 5 },
  { id: 'renew', name: 'Renovar', desc: 'Cura até o HP Máx.', rarity: Rarity.Common, icon: '💖', color: '#FFF', apply: (stats) => { stats.currentHp = stats.maxHp; }, maxLevel: 1 },
  { id: 'resist', name: 'Resistência', desc: 'Defesa +4%', rarity: Rarity.Common, icon: '🛡️', color: '#FFF', apply: (stats) => { stats.defense = Math.min(0.9, stats.defense + 0.04); }, maxLevel: 10 },
  { id: 'resonance', name: 'Ressonância', desc: 'Vel. de Ataque +12%', rarity: Rarity.Common, icon: '💨', color: '#FFF', apply: (stats) => { stats.baseFireRate *= 0.88; }, maxLevel: 10 },
  { id: 'souls', name: 'Almas', desc: 'Chance de dropar orbe de alma +1%', rarity: Rarity.Common, icon: '👻', color: '#FFF', apply: (stats) => { stats.healOrbChance += 0.01; }, maxLevel: 10 },
  { id: 'stability', name: 'Estabilidade', desc: 'Projétil aguenta +1 acerto antes de explodir', rarity: Rarity.Common, icon: '🧱', color: '#FFF', apply: (stats) => { stats.projectilePierceCount += 1; }, maxLevel: 5 },
  { id: 'swift', name: 'Rapidez', desc: 'Vel. de Movimento +20%', rarity: Rarity.Common, icon: '🏃', color: '#FFF', apply: (stats) => { stats.speed *= 1.20; }, maxLevel: 5 },

  // Uncommon
  { id: 'catalyst_plus', name: 'Catalisador+', desc: 'Dano do Projétil +4', rarity: Rarity.Uncommon, icon: '⚡+', color: '#3f3', apply: (stats) => { stats.baseProjectileDamage += 4; }, maxLevel: 10 },
  { id: 'charge', name: 'Carga', desc: 'Tamanho do Projétil +20%', rarity: Rarity.Uncommon, icon: '🔋', color: '#3f3', apply: (stats) => { stats.projectileSizeFactor = (stats.projectileSizeFactor || 1) * 1.20; }, maxLevel: 5 },
  { id: 'cloak', name: 'Manto', desc: 'Duração da invulnerabilidade após dano +10%', rarity: Rarity.Uncommon, icon: '🧥', color: '#3f3', apply: (stats) => {
    if (stats.invulnerabilityDuration === undefined) stats.invulnerabilityDuration = PLAYER_INVULNERABILITY_DURATION;
    stats.invulnerabilityDuration += PLAYER_INVULNERABILITY_DURATION * 0.10;
  }, maxLevel: 5 },
  { id: 'fragmentation', name: 'Fragmentação', desc: 'Ao morrer, inimigos explodem, liberando 2 projéteis mais fracos em direções aleatórias.', rarity: Rarity.Uncommon, icon: '💥', color: '#3f3', apply: (stats) => {
    stats.enemyShrapnel.enabled = true;
    stats.enemyShrapnel.count = Math.min(10, (stats.enemyShrapnel.count || 0) + 2);
    stats.enemyShrapnel.damageMultiplier = Math.max(0.1, (stats.enemyShrapnel.damageMultiplier || 0.3) - 0.05);
  }, maxLevel: 1 },
  { id: 'friction', name: 'Fricção', desc: 'Para cada metro que você corre, 1 projétil explosivo é lançado para cima.', rarity: Rarity.Uncommon, icon: '🔥👟', color: '#3f3', apply: (stats) => {
      stats.frictionStats.enabled = true;
      stats.frictionStats.distancePerProjectile = 50; // ~1 meter in pixels
      stats.frictionStats.projectilesPerActivation = 1;
      stats.frictionStats.projectileDamage = stats.baseProjectileDamage * 0.7;
      stats.frictionStats.explosionRadius = 50;
      stats.frictionStats.distanceRunSinceLastActivation = 0;
    }, maxLevel: 1
  },
  { id: 'growth_plus', name: 'Crescimento+', desc: 'HP Máx. +20', rarity: Rarity.Uncommon, icon: '💪+', color: '#3f3', apply: (stats) => { stats.maxHp += 20; stats.currentHp += 20; }, maxLevel: 10 },
  { id: 'gush', name: 'Jorro', desc: 'Adiciona +1 Pulo', rarity: Rarity.Uncommon, icon: '🤸+', color: '#3f3', apply: (stats) => { stats.maxJumps += 1; }, maxLevel: 3 },
  { id: 'leech', name: 'Sanguessuga', desc: 'Roubo de Vida de 3% do Dano', rarity: Rarity.Uncommon, icon: '🧛', color: '#3f3', apply: (stats) => { stats.lifesteal = Math.min(0.5, stats.lifesteal + 0.03); }, maxLevel: 10 },
  { id: 'luck', name: 'Sorte', desc: 'Maior chance de rolar itens incomuns', rarity: Rarity.Uncommon, icon: '🍀', color: '#3f3', apply: (stats) => { stats.luckFactor += 0.1; }, maxLevel: 5 },
  { id: 'orb_drop', name: 'Orbe Curativo', desc: 'Inimigos mortos têm 5% de chance de dropar um orbe de cura', rarity: Rarity.Uncommon, icon: '🔮', color: '#3f3', apply: (stats) => { stats.healOrbChance = Math.min(1, stats.healOrbChance + 0.05); }, maxLevel: 10 },
  { id: 'precision', name: 'Precisão', desc: 'Crítico causa +50% de dano', rarity: Rarity.Uncommon, icon: '🎯+', color: '#3f3', apply: (stats) => { stats.critMultiplier += 0.5; }, maxLevel: 5 },
  { id: 'rage', name: 'Fúria', desc: 'Se abaixo de 50% HP, aumenta seu dano de projétil e corpo (até 50%)', rarity: Rarity.Uncommon, icon: '😡', color: '#3f3', apply: (stats) => { /* Logic in GameView/damage calculation */ }, maxLevel: 1 },
  { id: 'regrowth', name: 'Recrescimento', desc: 'Regenera %HP baseado no número de inimigos vivos', rarity: Rarity.Uncommon, icon: '🌿', color: '#3f3', apply: (stats) => { /* Logic in GameView */ }, maxLevel: 1 },
  { id: 'resonance_plus', name: 'Ressonância+', desc: 'Vel. de Ataque +24%', rarity: Rarity.Uncommon, icon: '💨+', color: '#3f3', apply: (stats) => { stats.baseFireRate *= 0.76; }, maxLevel: 5 },
  { id: 'shrink', name: 'Encolher', desc: 'Te deixa 10% menor', rarity: Rarity.Uncommon, icon: '🤏', color: '#3f3', apply: (stats) => { stats.playerSizeMultiplier = Math.max(0.3, stats.playerSizeMultiplier * 0.9); }, maxLevel: 3 },
  { id: 'swift_plus', name: 'Rapidez+', desc: 'Vel. de Movimento +40%', rarity: Rarity.Uncommon, icon: '🏃+', color: '#3f3', apply: (stats) => { stats.speed *= 1.40; }, maxLevel: 3 },
  { id: 'thunderbolt', name: 'Raio Celestial', desc: 'Chama 2 raios dos céus a cada poucos segundos', rarity: Rarity.Uncommon, icon: '🌩️', color: '#3f3', apply: (stats) => {
      stats.lightningStrikes.enabled = true;
      stats.lightningStrikes.strikesPerCycle = Math.min(10, (stats.lightningStrikes.strikesPerCycle || 0) + 2);
      stats.lightningStrikes.damage = (stats.lightningStrikes.damage || 10) + 5;
      stats.lightningStrikes.cooldown = Math.max(500, (stats.lightningStrikes.cooldown || 5000) - 500);
      stats.lightningStrikes.radius = (stats.lightningStrikes.radius || 40) + 5;
    }, maxLevel: 5
  },

  // Epic
  { id: 'appraisal', name: 'Avaliação', desc: '+1 escolha de item de agora em diante', rarity: Rarity.Epic, icon: '🧐', color: '#3cf', apply: (stats) => { stats.upgradeChoices += 1; }, maxLevel: 2 },
  { id: 'barrier', name: 'Barreira', desc: 'Cria um escudo que bloqueia dano uma vez a cada poucos segundos', rarity: Rarity.Epic, icon: '🛡️✨', color: '#3cf', apply: (stats, currentLevel = 1) => {
      stats.shield.enabled = true;
      stats.shield.maxCooldown = Math.max(3000, (stats.shield.maxCooldown || 20000) - 2000 * currentLevel);
      if (!stats.shield.active && !stats.shield.cooldownActive) {
        stats.shield.active = true;
        stats.shield.cooldownTimeLeft = 0;
      }
    }, maxLevel: 3
  },
  { id: 'cold', name: 'Geada', desc: 'Inimigos ficam 1% mais lentos cada vez que sofrem dano (até 80%)', rarity: Rarity.Epic, icon: '🥶', color: '#3cf', apply: (stats) => {
    stats.slowOnHitChance = (stats.slowOnHitChance || 0) + 0.1;
    stats.slowOnHitPower = (stats.slowOnHitPower || 0) + 0.01;
    stats.maxSlowPower = 0.8;
    }, maxLevel: 1
  },
  { id: 'fragmentation_plus', name: 'Fragmentação+', desc: 'Ao morrer, inimigos explodem, liberando 6 projéteis mais fracos em direções aleatórias.', rarity: Rarity.Epic, icon: '💥+', color: '#3cf', apply: (stats) => {
    stats.enemyShrapnel.enabled = true;
    stats.enemyShrapnel.count = Math.min(20, (stats.enemyShrapnel.count || 0) + 6);
    stats.enemyShrapnel.damageMultiplier = Math.max(0.1, (stats.enemyShrapnel.damageMultiplier || 0.25) - 0.02);
  }, maxLevel: 1 },
  { id: 'friction_plus', name: 'Fricção+', desc: 'Para cada metro que você corre, 3 projéteis explosivos são lançados para cima.', rarity: Rarity.Epic, icon: '🔥👟+', color: '#3cf', apply: (stats) => {
      stats.frictionStats.enabled = true;
      stats.frictionStats.distancePerProjectile = 50;
      stats.frictionStats.projectilesPerActivation = 3;
      stats.frictionStats.projectileDamage = stats.baseProjectileDamage * 0.8; // Slightly more
      stats.frictionStats.explosionRadius = 60; // Slightly larger
      stats.frictionStats.distanceRunSinceLastActivation = 0;
    }, maxLevel: 1
  },
  { id: 'focus', name: 'Foco', desc: 'Ganha velocidade de ataque a cada segundo que você não se move. Reseta a cada onda', rarity: Rarity.Epic, icon: '🧘', color: '#3cf', apply: (stats) => { /* Logic in GameView */ }, maxLevel: 1 },
  { id: 'growth_plus_plus', name: 'Crescimento++', desc: 'HP Máx. +40', rarity: Rarity.Epic, icon: '💪++', color: '#3cf', apply: (stats) => { stats.maxHp += 40; stats.currentHp += 40; }, maxLevel: 5 },
  { id: 'leech_plus', name: 'Sanguessuga+', desc: 'Roubo de Vida de 9% do Dano', rarity: Rarity.Epic, icon: '🧛+', color: '#3cf', apply: (stats) => { stats.lifesteal = Math.min(0.75, stats.lifesteal + 0.09); }, maxLevel: 3 },
  { id: 'overheat', name: 'Superaquecimento', desc: 'Seu corpo causa 40 de dano ao contato', rarity: Rarity.Epic, icon: '🔥🥵', color: '#3cf', apply: (stats) => { stats.bodyDamage = (stats.bodyDamage || 0) + 40; }, maxLevel: 3 },
  { id: 'thunderbolt_plus', name: 'Raio Celestial+', desc: 'Chama 6 raios dos céus a cada poucos segundos', rarity: Rarity.Epic, icon: '🌩️+', color: '#3cf', apply: (stats) => {
      stats.lightningStrikes.enabled = true;
      stats.lightningStrikes.strikesPerCycle = Math.min(20, (stats.lightningStrikes.strikesPerCycle || 0) + 6);
      stats.lightningStrikes.damage = (stats.lightningStrikes.damage || 10) + 15;
      stats.lightningStrikes.cooldown = Math.max(300, (stats.lightningStrikes.cooldown || 5000) - 700);
      stats.lightningStrikes.radius = (stats.lightningStrikes.radius || 40) + 10;
    }, maxLevel: 3
  },
  { id: 'tome', name: 'Tomo', desc: 'Novos itens comuns (brancos) que você pega são 35% mais eficazes', rarity: Rarity.Epic, icon: '📜', color: '#3cf', apply: (stats) => { /* Logic in upgrade application */ }, maxLevel: 1 },
  { id: 'will_o_wisp', name: 'Fogo-Fátuo', desc: 'Invoca um fogo-fátuo que herda metade do seu dano de ataque e velocidade', rarity: Rarity.Epic, icon: '👻💡', color: '#3cf', apply: (stats, currentLevel = 1) => {
      stats.wisps.enabled = true;
      stats.wisps.count = Math.min(5, (stats.wisps.count || 0) + 1);
      stats.wisps.damageFactor = (0.4 + (currentLevel -1) * 0.1) || 0.5;
      stats.wisps.fireRateFactor = 1;
    }, maxLevel: 3
  },
  { id: 'wound', name: 'Ferimento', desc: 'Causar dano aplica sangramento ao inimigo', rarity: Rarity.Epic, icon: '🩸', color: '#3cf', apply: (stats) => { stats.canApplyWound = true; }, maxLevel: 1 },

  // Ascension Upgrades
   { id: 'anti_aircraft', name: 'Anti-Aéreo', desc: 'Aumenta o raio de explosão dos projéteis da "Fricção" em 50%. Requer Fricção.', rarity: Rarity.Ascension, icon: '💥✈️', color: '#DA70D6', apply: (stats) => {
      if (stats.frictionStats && stats.frictionStats.enabled) {
        stats.antiAircraftFrictionRadiusMultiplier = (stats.antiAircraftFrictionRadiusMultiplier || 1) * 1.5;
      }
    }, requires: ['friction'], maxLevel: 1
  },
  { id: 'absorbent', name: 'Absorvente', desc: 'Cada projétil que te atinge enquanto invulnerável te cura 1 HP. Receba 4 acúmulos de Manto.', rarity: Rarity.Ascension, icon: '🧽', color: '#DA70D6', apply: (stats) => {
      stats.absorbentHealOnInvulnHit = true;
      applyStackedUpgrade(stats, 'cloak', 4);
    }, maxLevel: 1
  },
  { id: 'avenger', name: 'Vingador', desc: 'Se você fosse morrer, em vez disso, mate metade dos inimigos e cure metade da sua vida. Possui 5 ondas de recarga. Receba 5 acúmulos de Fúria.', rarity: Rarity.Ascension, icon: '👼', color: '#DA70D6', apply: (stats) => {
      stats.avenger.enabled = true;
      stats.avenger.cooldownWavesLeft = 0;
      applyStackedUpgrade(stats, 'rage', 5);
    }, maxLevel: 1
  },
  { id: 'blessed_ascended', name: 'Abençoado Ascendido', desc: '5% de Chance de encontrar itens épicos. Receba 5 acúmulos de Sorte.', rarity: Rarity.Ascension, icon: '✨🍀', color: '#DA70D6', apply: (stats) => {
      stats.luckFactor += 0.05; // Specific chance for epics
      applyStackedUpgrade(stats, 'luck', 5);
    }, maxLevel: 1
  },
  { id: 'bloody_mage', name: 'Mago Sangrento', desc: 'Sangramento causa dano mais rápido. Receba 3 acúmulos de Ferimento.', rarity: Rarity.Ascension, icon: '🩸🧙', color: '#DA70D6', apply: (stats) => {
      stats.woundTickRateMultiplier = (stats.woundTickRateMultiplier || 1) * 2;
      applyStackedUpgrade(stats, 'wound', 3);
    }, maxLevel: 1
  },
  { id: 'bulldozer', name: 'Trator', desc: 'Empurrar inimigos com seu corpo fica mais fácil. Receba 8 acúmulos de Rapidez.', rarity: Rarity.Ascension, icon: '🚜', color: '#DA70D6', apply: (stats) => {
      stats.bodyPushbackForce = (stats.bodyPushbackForce || 0) + 100;
      applyStackedUpgrade(stats, 'swift', 8);
    }, maxLevel: 1
  },
  { id: 'bunker_fortress', name: 'Bunker Fortificado', desc: 'Ganha +4 de armadura (fixa) por segundo que não se move, até 95. Reseta a cada onda. Receba 3 acúmulos de Foco.', rarity: Rarity.Ascension, icon: '🏰', color: '#DA70D6', apply: (stats) => {
      stats.bunker.currentBonusFlatArmor = 0;
      applyStackedUpgrade(stats, 'focus', 3);
    }, maxLevel: 1
  },
  { id: 'burning_man_inferno', name: 'Homem em Chamas Infernal', desc: 'Causa seu dano de corpo a cada 2 segundos em um círculo ao seu redor. Receba 3 acúmulos de Superaquecimento.', rarity: Rarity.Ascension, icon: '🔥😈', color: '#DA70D6', apply: (stats) => {
      stats.burningManAura.enabled = true;
      stats.burningManAura.radius = 150;
      stats.burningManAura.tickInterval = 2000;
      applyStackedUpgrade(stats, 'overheat', 3);
      stats.burningManAura.damage = stats.bodyDamage; // Update damage after Overheat stacks
    }, maxLevel: 1
  },
  { id: 'colossus_form', name: 'Forma de Colosso', desc: 'Seu HP é dobrado e seu tamanho é dobrado. Receba 15 acúmulos de Crescimento.', rarity: Rarity.Ascension, icon: '🗿', color: '#DA70D6', apply: (stats) => {
      stats.maxHp *= 2;
      stats.currentHp *=2;
      stats.playerSizeMultiplier *= 2;
      applyStackedUpgrade(stats, 'growth', 15);
    }, maxLevel: 1
  },
  { id: 'comet_impact', name: 'Impacto de Cometa', desc: 'Após cair de um pulo, cause dano em área baseado na distância da sua queda. Receba 5 acúmulos de Impulso.', rarity: Rarity.Ascension, icon: '☄️', color: '#DA70D6', apply: (stats) => {
      stats.cometLanding.enabled = true;
      stats.cometLanding.damagePerYPixel = (stats.cometLanding.damagePerYPixel || 0.1) + 0.1;
      stats.cometLanding.maxDamage = (stats.cometLanding.maxDamage || 200) + 100;
      applyStackedUpgrade(stats, 'impulse', 5);
    }, maxLevel: 1
  },
  { id: 'dealer_master', name: 'Negociante Mestre', desc: 'Você pode re-rolar de graça. Receba 4 acúmulos de Avaliação.', rarity: Rarity.Ascension, icon: '🃏', color: '#DA70D6', apply: (stats) => {
      stats.rerollsAvailable = 99;
      applyStackedUpgrade(stats, 'appraisal', 4);
    }, maxLevel: 1
  },
   { id: 'desperate_measures', name: 'Medidas Desesperadas', desc: 'Cura até o HP máximo no início de cada onda. Pegue Renovar 5 vezes.', rarity: Rarity.Ascension, icon: '🙏', color: '#DA70D6', apply: (stats) => {
      stats.desperateHealOnWaveStart = true;
      applyStackedUpgrade(stats, 'renew', 5);
    }, maxLevel: 1
  },
  { id: 'enchanter_prime', name: 'Encantador Primordial', desc: 'Fogos-Fátuos agora se concentram perto da ponta do seu cajado e atiram na direção que você está mirando. Receba 4 acúmulos de Fogo-Fátuo.', rarity: Rarity.Ascension, icon: '👻🎯', color: '#DA70D6', apply: (stats) => {
      stats.wisps.enchanterModeActive = true;
      applyStackedUpgrade(stats, 'will_o_wisp', 4);
    }, maxLevel: 1, requires: ['will_o_wisp']
  },
  { id: 'exorcist_grand', name: 'Exorcista Grandioso', desc: 'Um raio de alma é liberado quando você pega um orbe de alma. Receba 6 acúmulos de Almas.', rarity: Rarity.Ascension, icon: '👻💥', color: '#DA70D6', apply: (stats) => {
      stats.exorcistSoulBeam.enabled = true;
      stats.exorcistSoulBeam.damage = (stats.exorcistSoulBeam.damage || 20) + 30;
      applyStackedUpgrade(stats, 'souls', 6);
    }, maxLevel: 1
  },
  { id: 'freezer_absolute', name: 'Congelador Absoluto', desc: 'Agora pode desacelerar inimigos até 100%. Quando isso acontece, dano de qualquer fonte tem 1% de chance de matar o inimigo instantaneamente. Receba 3 acúmulos de Geada.', rarity: Rarity.Ascension, icon: '🥶❄️', color: '#DA70D6', apply: (stats) => {
      stats.maxSlowPower = 1.0;
      stats.freezerInstaKillChance = (stats.freezerInstaKillChance || 0) + 0.01;
      applyStackedUpgrade(stats, 'cold', 3);
    }, maxLevel: 1
  },
  { id: 'flying_sorcerer', name: 'Feiticeiro Voador', desc: 'Você pode pular o quanto quiser. Receba 5 acúmulos de Jorro.', rarity: Rarity.Ascension, icon: '🧙‍♂️✈️', color: '#DA70D6', apply: (stats) => {
      stats.maxJumps = 999;
      applyStackedUpgrade(stats, 'gush', 5);
    }, maxLevel: 1
  },
  { id: 'gnome_king', name: 'Rei Gnomo', desc: 'Projéteis inimigos têm 33% de chance de errar. Receba 5 acúmulos de Encolher.', rarity: Rarity.Ascension, icon: '🍄👑', color: '#DA70D6', apply: (stats) => {
      stats.enemyProjectileMissChance = Math.min(0.9, (stats.enemyProjectileMissChance || 0) + 0.33);
      applyStackedUpgrade(stats, 'shrink', 5);
    }, maxLevel: 1
  },
  { id: 'god_of_thunder', name: 'Deus do Trovão', desc: 'Seus raios causam 3x mais dano, incluindo o raio invocado pelo Cajado do Trovão (se houver). Receba 10 acúmulos de Raio Celestial.', rarity: Rarity.Ascension, icon: '👑🌩️', color: '#DA70D6', apply: (stats) => {
      stats.lightningStrikes.damage = (stats.lightningStrikes.damage || 10) * 3;
      stats.lightningStrikes.strikesPerCycle = Math.min(30, (stats.lightningStrikes.strikesPerCycle || 0) + 5);
      stats.lightningStrikes.radius = (stats.lightningStrikes.radius || 40) * 1.5;
      stats.lightningStrikes.cooldown = Math.max(100, (stats.lightningStrikes.cooldown || 5000) / 2);
      applyStackedUpgrade(stats, 'thunderbolt', 10);
    }, maxLevel: 1, requires: ['thunderbolt']
  },
  { id: 'hoarder_dragon', name: 'Acumulador Draconiano', desc: 'Orbes de cura que você pega dão ao seu próximo ataque uma carga (pode acumular). Receba 5 acúmulos de Orbe Curativo.', rarity: Rarity.Ascension, icon: '💰🐉', color: '#DA70D6', apply: (stats) => {
      stats.hoarderCharges.bonusDamagePerCharge = (stats.hoarderCharges.bonusDamagePerCharge || 5) + 10;
      stats.hoarderCharges.maxCharges = (stats.hoarderCharges.maxCharges || 5) + 5;
      applyStackedUpgrade(stats, 'orb_drop', 5);
    }, maxLevel: 1
  },
  { id: 'marksman_deadeye', name: 'Atirador de Elite Mortal', desc: 'Seu primeiro acerto é sempre um crítico. Receba 6 acúmulos de Visão Aguçada.', rarity: Rarity.Ascension, icon: '🎯💯', color: '#DA70D6', apply: (stats) => {
      stats.marksmanFirstHitCritConsumed = false;
      applyStackedUpgrade(stats, 'eyesight', 6);
    }, maxLevel: 1
  },
  { id: 'nerd_archmage', name: 'Nerd Arquimago', desc: 'Receba uma carta comum aleatória a cada onda. Receba 4 acúmulos de Tomo.', rarity: Rarity.Ascension, icon: '🤓📚', color: '#DA70D6', apply: (stats) => {
      stats.nerdRandomCommonCardPerWave = true;
      applyStackedUpgrade(stats, 'tome', 4);
    }, maxLevel: 1
  },
  { id: 'pac_man_champion', name: 'Campeão Pac-Man', desc: 'Cada vez que seus projéteis atravessam um projétil inimigo, aumente seu dano. Receba 5 acúmulos de Estabilidade.', rarity: Rarity.Ascension, icon: '🟡👾', color: '#DA70D6', apply: (stats) => {
      stats.pacManBonusPerPassThrough = (stats.pacManBonusPerPassThrough || 0) + 2;
      applyStackedUpgrade(stats, 'stability', 5);
    }, maxLevel: 1
  },
  { id: 'plague_spreader_lord', name: 'Lorde Espalhador de Pragas', desc: 'Remove 1% do HP de todos os seus inimigos a cada 1 segundo. Receba 5 acúmulos de Recrescimento.', rarity: Rarity.Ascension, icon: '☣️👑', color: '#DA70D6', apply: (stats) => {
      stats.plagueAura.enabled = true;
      stats.plagueAura.percentHPDamagePerTick = (stats.plagueAura.percentHPDamagePerTick || 0.0025) + 0.0025; // Scales a bit if taken again
      stats.plagueAura.tickInterval = 250;
      applyStackedUpgrade(stats, 'regrowth', 5);
    }, maxLevel: 1
  },
  { id: 'protector_guardian', name: 'Guardião Protetor', desc: 'Quando seu escudo quebra, dispare projéteis ao seu redor. Receba 3 acúmulos de Barreira.', rarity: Rarity.Ascension, icon: '🛡️💥', color: '#DA70D6', apply: (stats) => {
      stats.protectorShards.enabled = true;
      stats.protectorShards.count = (stats.protectorShards.count || 5) + 5;
      stats.protectorShards.damageFactor = (stats.protectorShards.damageFactor || 0.3) + 0.2;
      applyStackedUpgrade(stats, 'barrier', 3);
    }, maxLevel: 1
  },
  { id: 'ram_destroyer_god', name: 'Deus Destruidor de RAM', desc: 'Balas de fragmentação decaem menos. Receba 10 acúmulos de Fragmentação.', rarity: Rarity.Ascension, icon: '🐏💥', color: '#DA70D6', apply: (stats) => {
      stats.enemyShrapnel.count = Math.min(30, (stats.enemyShrapnel.count || 2) + 10);
      stats.enemyShrapnel.damageMultiplier = Math.min(1, (stats.enemyShrapnel.damageMultiplier || 0.25) + 0.25);
      applyStackedUpgrade(stats, 'fragmentation', 10);
    }, maxLevel: 1
  },
  { id: 'sadistic_masochist', name: 'Sádico Masoquista', desc: 'Cause dano de volta ao atacante. Receba 6 acúmulos de Resistência.', rarity: Rarity.Ascension, icon: '😈🤕', color: '#DA70D6', apply: (stats) => {
      stats.sadisticThorns.enabled = true;
      stats.sadisticThorns.reflectFraction = Math.min(1, (stats.sadisticThorns.reflectFraction || 0) + 0.5);
      applyStackedUpgrade(stats, 'resist', 6);
    }, maxLevel: 1
  },
  { id: 'speculator_gambler', name: 'Especulador Apostador', desc: 'Pode causar super acertos críticos. Receba 5 acúmulos de Precisão.', rarity: Rarity.Ascension, icon: '🎲✨', color: '#DA70D6', apply: (stats) => {
      stats.speculatorSuperCrit.chanceFromCrit = Math.min(1, (stats.speculatorSuperCrit.chanceFromCrit || 0) + 0.1);
      stats.speculatorSuperCrit.multiplier = (stats.speculatorSuperCrit.multiplier || 2) + 1;
      applyStackedUpgrade(stats, 'precision', 5);
    }, maxLevel: 1
  },
  { id: 'streamer_showcaster', name: 'Streamer Showcaster', desc: 'Dispara um raio do seu cajado que causa dano baseado na velocidade de ataque. Receba 8 acúmulos de Ressonância.', rarity: Rarity.Ascension, icon: '📺빔', color: '#DA70D6', apply: (stats) => {
      stats.streamerBeam.enabled = true;
      stats.streamerBeam.dpsPerAttackSpeedStatUnit = (stats.streamerBeam.dpsPerAttackSpeedStatUnit || 0) + 50;
      applyStackedUpgrade(stats, 'resonance', 8);
    }, maxLevel: 1
  },
  { id: 'tryhard_legend', name: 'Lenda Tryhard', desc: 'Não faz absolutamente nada. Receba 20 acúmulos de Catalisador.', rarity: Rarity.Ascension, icon: '🏆🤡', color: '#DA70D6', apply: (stats) => {
      applyStackedUpgrade(stats, 'catalyst', 20);
    }, maxLevel: 1
  },
  { id: 'vampire_lord', name: 'Lorde Vampiro', desc: 'Metade de todo o seu dano retorna como HP. Receba 12 acúmulos de Sanguessuga.', rarity: Rarity.Ascension, icon: '🧛👑', color: '#DA70D6', apply: (stats) => {
      stats.lifesteal = 0.5;
      applyStackedUpgrade(stats, 'leech', 12);
    }, maxLevel: 1
  },
  { id: 'white_dwarf_star', name: 'Estrela Anã Branca', desc: 'O tamanho do seu projétil volta ao normal. Se um projétil atingir o chão ou paredes, torna-se um buraco negro. Receba 5 acúmulos de Carga.', rarity: Rarity.Ascension, icon: '🌟⚫', color: '#DA70D6', apply: (stats) => {
      stats.projectileSizeFactor = 1;
      stats.whiteDwarfBlackHole.enabled = true;
      stats.whiteDwarfBlackHole.duration = (stats.whiteDwarfBlackHole.duration || 3000) + 1000;
      stats.whiteDwarfBlackHole.pullForce = (stats.whiteDwarfBlackHole.pullForce || 150) + 50;
      stats.whiteDwarfBlackHole.radius = (stats.whiteDwarfBlackHole.radius || 100) + 20;
      applyStackedUpgrade(stats, 'charge', 5);
    }, maxLevel: 1
  },
  // Celestial - Existing, already in PT
  {
    id: 'efeito_domino_cosmico',
    name: '💥 Efeito Dominó Cósmico',
    desc: 'Inimigos derrotados explodem! Se a explosão matar outro, BUM de novo! Nível aumenta dano, raio e chance de fragmentos explosivos.',
    rarity: Rarity.Celestial,
    icon: '🌌',
    color: '#FFB74D',
    apply: (stats) => {
      stats.chainExplosion.enabled = true;
      stats.chainExplosion.level = (stats.chainExplosion.level || 0) + 1;
      const level = stats.chainExplosion.level;
      stats.chainExplosion.baseDamage = 15 + (level * 7);
      stats.chainExplosion.baseRadius = 50 + (level * 15);
      stats.chainExplosion.fragmentsPerExplosion = Math.min(8, 2 + level);
      stats.chainExplosion.fragmentDamageMultiplier = 0.25 + level * 0.05;
      stats.chainExplosion.maxChainDepth = 2 + Math.floor(level / 2);
    },
    maxLevel: 3
  },
  {
    id: 'conversor_entropico',
    name: '💠 Conversor Entrópico',
    desc: 'Inimigos derrotados têm chance de soltar Fragmentos Entrópicos. Coletá-los concede um bônus de dano acumulativo temporário.',
    rarity: Rarity.Celestial,
    icon: '💠',
    color: '#80DEEA',
    apply: (stats) => {
      // Logic for enabling is enough, collection handles stats
      stats.ownedUpgrades['conversor_entropico'] = 1; // Mark as owned
    },
    maxLevel: 1
  },
  {
    id: 'alma_cajado_pipoca',
    name: '🍿 Alma do Canhão de Pipoca',
    desc: 'O Canhão de Pipoca é abençoado! Caroços de pipoca agora geram mini-fragmentos explosivos ao detonar.',
    rarity: Rarity.Celestial,
    icon: '🌟',
    color: '#FFF59D',
    apply: (stats) => {
      stats.activeStaffSoulEffect = 'pipoca_multiply';
    },
    maxLevel: 1,
    requires: ['canhao_pipoca'] // Actually checks selectedStaff.id in GameView
  },
];

export const UPGRADES: Upgrade[] = [...ALL_UPGRADES_DEFINITIONS];


export const API_BASE_URL = 'https://howdyhey.squareweb.app';
export const API_ENDPOINTS = {
  ADD_PLAYER: `${API_BASE_URL}/player`,
  GET_TOP10: `${API_BASE_URL}/top10`,
};

export const PLAYER_BASE_WIDTH = PLAYER_SPRITE_DISPLAY_WIDTH;
export const PLAYER_BASE_HEIGHT = PLAYER_SPRITE_DISPLAY_HEIGHT;

export const HIT_FLASH_DURATION = 100; // ms for enemy hit flash

export const ENEMY_DEFAULT_WIDTH = 40;
export const ENEMY_DEFAULT_HEIGHT = 40;
export const ENEMY_BASE_SPEED = 100;
export const ENEMY_BASE_HP = 20;
export const ENEMY_BASE_DAMAGE = 10;
export const ENEMY_BASE_PROJECTILE_DAMAGE = 8;
export const TARGET_FALL_Y_ON_SCREEN = 100;
export const ENEMY_FALL_IN_SPEED = 200;

export const ENEMY_VERTICAL_BOB_SPEED = 30;
export const ENEMY_VERTICAL_BOB_RANGE = 25;
export const ENEMY_VERTICAL_BOB_COOLDOWN_MIN = 2000;
export const ENEMY_VERTICAL_BOB_COOLDOWN_MAX = 3500;
export const ENEMY_ABSOLUTE_TARGET_X_UPDATE_MIN_COOLDOWN = 2500;
export const ENEMY_ABSOLUTE_TARGET_X_UPDATE_MAX_COOLDOWN = 4500;
export const ENEMY_HORIZONTAL_SPREAD_RANGE = GAME_WIDTH * 0.6;

export const ENEMY_BOBBING_CENTER_Y_UPDATE_MIN_COOLDOWN = 3000;
export const ENEMY_BOBBING_CENTER_Y_UPDATE_MAX_COOLDOWN = 5500;
export const ENEMY_BOBBING_CENTER_Y_SHIFT_AMOUNT = 60;
export const ENEMY_MIN_Y_TARGET_AREA = 70;
export const ENEMY_MAX_Y_TARGET_AREA = GAME_HEIGHT * 0.45;

// Wave System Constants
export const INITIAL_ENEMIES_PER_WAVE = 5;
export const ENEMIES_PER_WAVE_INCREMENT = 2;
export const BOSS_WAVE_INTERVAL = 5;
export const AVENGER_COOLDOWN_WAVES = 5; // For Avenger upgrade

// Dynamic Event: Meteor Shower
export const METEOR_SHOWER_EVENT_DURATION = 15000; // 15 seconds
export const METEOR_SPAWN_INTERVAL = 1000; // Spawn a meteor (warning) every 1 second
export const METEOR_WARNING_DURATION = 1500; // Warning visible for 1.5 seconds
export const METEOR_IMPACT_RADIUS = 60;
export const METEOR_IMPACT_DAMAGE = 25;


export const UFO_SNIPER_HP_BASE = 25;
export const UFO_SNIPER_PROJECTILE_DAMAGE_BASE = 7;
export const UFO_SNIPER_SPEED = 40;
export const UFO_SNIPER_SHOOT_COOLDOWN = 2800; //ms
export const UFO_SNIPER_TARGET_X_UPDATE_COOLDOWN = 1500;

export const ALIEN_SWARMER_SHOOT_COOLDOWN = 4000; // ms
export const ALIEN_SWARMER_PROJECTILE_DAMAGE = 4;
export const ALIEN_SWARMER_PROJECTILE_SPEED_MULTIPLIER = 0.6;
export const ALIEN_SPIT_WIDTH = 8;
export const ALIEN_SPIT_HEIGHT = 8;

export const BASE_PROJECTILE_WIDTH = 8;
export const BASE_PROJECTILE_HEIGHT = 16;
export const BASE_PLAYER_PROJECTILE_SPEED = 700;
export const ENEMY_PROJECTILE_SPEED = 400;
export const BOSS_PROJECTILE_SPEED = 300;

export const HEALING_ORB_SIZE = 20;
export const HEALING_ORB_HEAL_AMOUNT = 20;
export const HEALING_ORB_DURATION = 8000;
export const ORB_GRAVITY = 1500;
export const ORB_INITIAL_POP_VELOCITY = -150;

export const FLOATING_TEXT_DURATION = 1000;
export const LIGHTNING_WARN_DURATION = 500;
export const EXPLOSION_EFFECT_DURATION = 300;
export const SLICK_TRAIL_SEGMENT_DURATION = 3000;
export const RADIATION_TRAIL_SEGMENT_DURATION = 2000;
export const BOSS_TELEGRAPH_DURATION = 1000;
export const PROJECTILE_TRAIL_PARTICLE_DURATION = 350;
export const PROJECTILE_TRAIL_PARTICLE_SIZE = 4;

// Particle Effect Constants
export const ENEMY_DEATH_PARTICLE_DURATION = 600;
export const ENEMY_DEATH_PARTICLE_COUNT = 10;
export const ENEMY_DEATH_PARTICLE_SIZE = 5;
export const ENEMY_DEATH_PARTICLE_SPEED = 80;

export const PROJECTILE_IMPACT_PARTICLE_DURATION = 400;
export const PROJECTILE_IMPACT_PARTICLE_COUNT = 5;
export const PROJECTILE_IMPACT_PARTICLE_SIZE = 3;
export const PROJECTILE_IMPACT_PARTICLE_SPEED = 100;


export const SHRAPNEL_PROJECTILE_SPEED = 500; // Increased from 300
export const SHRAPNEL_PROJECTILE_SIZE = 6;

// Boss Specifics
export const BOSS_STATS = {
    HP_BASE: 500,
    HP_SCALING_PER_WAVE_INTERVAL: 250,
    CONTACT_DAMAGE_BASE: 30,
    HOMING_PROJECTILE_DAMAGE: 20,
    BEAM_TICK_DAMAGE: 5,
    AOE_SLAM_DAMAGE: 40,
    SPEED: 60,
    WIDTH: ENEMY_DEFAULT_WIDTH * 2.5,
    HEIGHT: ENEMY_DEFAULT_HEIGHT * 2.5,
};

export const BOSS_ATTACK_PATTERN_CONFIG = {
    HOMING_SHOT_COUNT: 3,
    HOMING_SHOT_COOLDOWN: 4000,
    MINION_SUMMON_COUNT: 5,
    MINION_SUMMON_COOLDOWN: 6000,
    MINION_TYPE: 'alien_swarmer' as EnemyType,
    BEAM_DURATION: 3000,
    BEAM_WIDTH: 30,
    BEAM_COOLDOWN: 7000,
    AOE_SLAM_RADIUS: 150,
    AOE_SLAM_COOLDOWN: 5000,
    IDLE_DURATION_MIN: 1000,
    IDLE_DURATION_MAX: 2000,
    GENERAL_PATTERN_CHANGE_COOLDOWN: 2000,
};
export const BOSS_MINION_SUMMON_OFFSET_Y = 50;
export const BOSS_BEAM_WARN_DURATION = 1200;
export const BOSS_BEAM_TICK_INTERVAL = 100;

// Platform Styling Constants for the new smooth ground
export const PLATFORM_BODY_COLOR = '#211E2B';
export const PLATFORM_TOP_COLOR = '#6D28D9';  // This was the purple border color
export const PLATFORM_STROKE_THICKNESS = '6px';
export const GROUND_SMOOTHING_TENSION = 0.5;

// Enemy AI Specific Constants
export const GHOST_MIN_SEPARATION_DISTANCE = 30;
export const GHOST_SCATTER_STRENGTH = 80;
export const GHOST_SCATTER_COOLDOWN = 300;
export const GHOST_PLAYER_ORBIT_RADIUS_MIN = 80;
export const GHOST_PLAYER_ORBIT_RADIUS_MAX = 150;
export const GHOST_PLAYER_TARGET_UPDATE_COOLDOWN = 1500;

// Grass Constants
export const GRASS_BLADE_COUNT_PER_SEGMENT = 12;
export const GRASS_BLADE_BASE_HEIGHT = 15;
export const GRASS_BLADE_HEIGHT_VARIATION = 5;
export const GRASS_BLADE_WIDTH = 2;
export const GRASS_COLORS = [
    "rgba(50, 150, 50, 0.8)",
    "rgba(70, 180, 70, 0.7)",
    "rgba(40, 130, 40, 0.85)"
];
export const GRASS_WIND_STRENGTH = 15; // Degrees of bend
export const GRASS_WIND_SPEED = 0.5; // Radians per second for the sin wave
export const GRASS_BEND_ANGLE = 45;
export const GRASS_BEND_RECOVERY_SPEED = 180;
export const GRASS_PLAYER_INTERACTION_RADIUS = 50;

// Comet Landing default values
export const COMET_IMPACT_BASE_DAMAGE_PER_Y_PIXEL = 0.1;
export const COMET_IMPACT_MAX_FALL_DAMAGE_CAP = 150;
export const COMET_IMPACT_MIN_FALL_DISTANCE = PLAYER_BASE_HEIGHT * 2; // Min fall to trigger
export const COMET_IMPACT_RADIUS_BASE = 80;

// Will-O-Wisp defaults
export const WISP_BASE_COUNT = 1;
export const WISP_DAMAGE_FACTOR_BASE = 0.5; // 50% of player's projectile damage
export const WISP_FIRE_RATE_FACTOR_BASE = 1.0; // Same fire rate as player
export const WISP_ORBIT_RADIUS = 60;
export const WISP_ORBIT_SPEED = 2; // Radians per second
export const WISP_PROJECTILE_SPEED = 500;
export const WISP_PROJECTILE_SIZE = 8;
export const WISP_AIM_LERP_FACTOR = 0.1; // How quickly wisps aim with Enchanter

// Avenger default values
export const AVENGER_DEFAULT_COOLDOWN_WAVES = 5;

// Burning Man Aura defaults
export const BURNING_MAN_AURA_BASE_RADIUS = 100;
export const BURNING_MAN_AURA_TICK_INTERVAL_MS = 2000;

// Plague Spreader Aura defaults
export const PLAGUE_AURA_PERCENT_DAMAGE_PER_SECOND = 0.01; // 1%
export const PLAGUE_AURA_TICK_INTERVAL_MS = 1000; // Tick every second

// Protector Shards defaults
export const PROTECTOR_SHARDS_BASE_COUNT = 8;
export const PROTECTOR_SHARDS_DAMAGE_FACTOR = 0.25; // 25% of player's projectile damage
export const PROTECTOR_SHARDS_SPEED = 400;

// Sadistic Thorns defaults
export const SADISTIC_THORNS_BASE_REFLECT_FRACTION = 0.25; // Reflect 25% of damage taken

// Streamer Beam defaults
export const STREAMER_BEAM_BASE_DPS_FACTOR = 20; // Example: if player shoots 4 times/sec (250ms fireRate), DPS = 4 * 20 = 80

// White Dwarf Black Hole defaults
export const WHITE_DWARF_BH_DURATION_MS = 3000;
export const WHITE_DWARF_BH_PULL_FORCE = 150;
export const WHITE_DWARF_BH_RADIUS = 100;

// Constants for "stacks" granting. These map to IDs in ALL_UPGRADES_DEFINITIONS
export const STACKABLE_UPGRADE_IDS = {
  CLOAK: 'cloak',
  FRICTION: 'friction',
  RAGE: 'rage',
  LUCK: 'luck',
  WOUND: 'wound',
  SWIFT: 'swift',
  FOCUS: 'focus',
  OVERHEAT: 'overheat',
  GROWTH: 'growth',
  IMPULSE: 'impulse',
  APPRAISAL: 'appraisal',
  WILL_O_WISP: 'will_o_wisp',
  SOULS: 'souls',
  COLD: 'cold',
  GUSH: 'gush',
  SHRINK: 'shrink',
  THUNDERBOLT: 'thunderbolt',
  ORB: 'orb_drop', 
  EYESIGHT: 'eyesight',
  TOME: 'tome',
  STABILITY: 'stability',
  REGROWTH: 'regrowth',
  BARRIER: 'barrier',
  FRAGMENTATION: 'fragmentation',
  RESIST: 'resist',
  PRECISION: 'precision',
  RESONANCE: 'resonance',
  CATALYST: 'catalyst',
  LEECH: 'leech',
  CHARGE: 'charge',
};