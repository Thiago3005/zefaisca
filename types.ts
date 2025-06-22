
export enum GameStatus {
  MainMenu,
  Playing,
  Paused, // For level up or staff selection
  GameOver,
}

export enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',         // Added
  Ascension = 'ascension', // Added
  Celestial = 'celestial',
}

export type EnemyType =
  | 'slime'
  | 'shooter'
  | 'dasher'
  | 'demon_shooter'
  | 'ghost_dasher'
  | 'poop_tank'
  | 'alien_swarmer'
  | 'robot_brute'
  | 'ufo_sniper'
  | 'sombra_ofuscante'    // New
  | 'tecelao_gravitacional' // New
  | 'sentinela_reparadora'  // New
  | 'boss_celestial_guardian';

export interface PlayerStats {
  level: number;
  maxHp: number;
  currentHp: number;
  defense: number; // Percentage reduction, e.g., 0.1 for 10%
  speed: number;
  maxJumps: number;
  baseProjectileDamage: number;
  baseFireRate: number; // Milliseconds between shots
  critChance: number;
  critMultiplier: number;
  lifesteal: number;
  healOrbChance: number;
  bodyDamage: number;
  canApplyWound: boolean;
  upgradeChoices: number;
  ownedUpgrades: Record<string, number>; // Maps upgrade ID to its current level
  rerollsAvailable: number;

  lightningStrikes: {
    enabled: boolean;
    damage: number;
    cooldown: number;
    radius: number;
    strikesPerCycle: number;
    lastCycleTime: number;
  };
  chainExplosion: {
    enabled: boolean;
    level: number;
    baseDamage: number;
    baseRadius: number;
    fragmentDamageMultiplier: number;
    fragmentsPerExplosion: number;
    maxChainDepth: number;
  };
  reflectProjectile: {
    enabled: boolean;
    chance: number;
    damageMultiplier: number;
  };
  slickTrailMaker: {
    enabled: boolean;
    slowAmount: number;
    duration: number;
  };
  atomicChicken: {
    enabled: boolean;
    radiationDamage: number;
    bounceExplosionRadius: number;
    bounceExplosionDamage: number;
  };
  coffeeBuff: {
    active: boolean;
    durationLeft: number;
    speedMultiplier: number;
    fireRateMultiplier: number;
  };

  projectilePierceCount: number;
  dodgeChance: number;
  playerSizeMultiplier: number;
  luckFactor: number; // Higher luck = better rarity chances

  shield: {
    enabled: boolean;
    active: boolean;
    cooldownActive: boolean;
    cooldownTimeLeft: number;
    maxCooldown: number;
  };
  slowOnHitChance: number;
  slowOnHitDuration: number;
  slowOnHitPower: number;
  ghostShotChance: number;

  enemyShrapnel: { // For "Fragmentation" type upgrades
    enabled: boolean;
    count: number;
    damageMultiplier: number;
  }

  // For Celestial Upgrades
  collectedEntropicFragments: number;
  entropicBuffDuration: number; // Time left for the buff from fragments
  activeStaffSoulEffect?: string; // e.g., 'pipoca_multiply'

  // NEW STATS FOR CHAOTIC UPGRADES (from user prompt)
  absorbentHealOnInvulnHit?: boolean;
  avenger?: {
    enabled: boolean;
    cooldownWavesLeft: number;
    lastActivationWave: number;
  };
  woundTickRateMultiplier?: number; // e.g., 2 for double speed
  bodyPushbackForce?: number;
  bunker?: {
    currentBonusFlatArmor: number; // Flat armor, not percentage
    secondsStationary: number; // Tracked in GameView
  };
  burningManAura?: {
    enabled: boolean;
    damage: number;
    radius: number;
    tickInterval: number;
    lastTickTime: number;
  };
  cometLanding?: {
    enabled: boolean;
    damagePerYPixel: number;
    maxDamage: number;
  };
  desperateHealOnWaveStart?: boolean;
  wisps?: {
    enabled: boolean;
    count: number;
    damageFactor: number; // Multiplier of player's base projectile damage
    fireRateFactor: number; // Multiplier of player's baseFireRate
    enchanterModeActive: boolean; // From Enchanter upgrade
  };
  exorcistSoulBeam?: {
    enabled: boolean;
    damage: number;
  };
  maxSlowPower?: number; // For Freezer upgrade to cap slow at 100%
  freezerInstaKillChance?: number;
  enemyProjectileMissChance?: number; // For Gnome
  // God of Thunder modifies existing lightningStrikes
  hoarderCharges?: {
    current: number;
    bonusDamagePerCharge: number;
    maxCharges?: number; // Optional
  };
  marksmanFirstHitCritConsumed?: boolean; // For Marksman, reset appropriately
  nerdRandomCommonCardPerWave?: boolean;
  pacManBonusPerPassThrough?: number; // For Pac-Man projectile enhancement
  plagueAura?: {
    enabled: boolean;
    percentHPDamagePerTick: number;
    tickInterval: number;
    lastTickTime: number;
  };
  protectorShards?: { // For Protector upgrade
    enabled: boolean;
    count: number;
    damageFactor: number; // Multiplier of player's base projectile damage
  };
  // RAM Destroyer modifies existing enemyShrapnel stats
  sadisticThorns?: {
    enabled: boolean;
    reflectFraction: number;
  };
  speculatorSuperCrit?: {
    chanceFromCrit: number; // e.g., 0.1 for 10% of crits become super
    multiplier: number; // Damage multiplier for the super crit part
  };
  streamerBeam?: {
    enabled: boolean;
    dpsPerAttackSpeedStatUnit: number; // Base DPS derived from (1 / baseFireRate)
  };
  // Tryhard: No specific stat needed here, its 'apply' will grant Catalyst stacks.
  // Vampire: Modifies existing 'lifesteal' stat.
  projectileSizeFactor?: number; // For Charge, White Dwarf. Default 1.
  whiteDwarfBlackHole?: {
    enabled: boolean; // For the black hole aspect
    duration: number;
    pullForce: number;
    radius: number;
  };
  invulnerabilityDuration?: number; // Duration of invulnerability after taking damage

  // Friction upgrade stats
  frictionStats: {
    enabled: boolean;
    distancePerProjectile: number; // pixels
    projectilesPerActivation: number;
    projectileDamage: number;
    explosionRadius: number;
    distanceRunSinceLastActivation: number;
  };
  antiAircraftFrictionRadiusMultiplier: number; // Multiplier for friction explosion radius from Anti-Aéreo
}


export interface Accessory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  applyStats: (stats: PlayerStats) => PlayerStats;
}

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  color: string;
  icon: string;
  apply: (stats: PlayerStats, currentLevel?: number) => void; // Added currentLevel for multi-stack application
  maxLevel?: number;
  requires?: string[]; // For upgrades that depend on others (e.g. God of Thunder needs Thunderbolt)
}

export interface Staff {
  id: string;
  name: string;
  description: string;
  emoji: string;
  fireRateModifier?: number;
  damageModifier?: number;
  projectileSpeedModifier?: number;
  projectileVisual: ProjectileVisualType;
  shotgunPellets?: number;
  homing?: boolean;
  explodesOnImpact?: boolean;
  explosionRadius?: number;
  bounces?: number;
  stunChance?: number;
  stunDuration?: number;
  silenceChance?: number;
  silenceDuration?: number;
  curseChance?: number;
}

export type ProjectileVisualType =
  | 'default_magic'
  | 'chinelo'
  | 'pipoca_kernel'
  | 'soap_bubble'
  | 'plunger'
  | 'slipper'
  | 'chicken'
  | 'lightning_bolt'
  | 'shrapnel'
  | 'pipoca_fragment' // New for Alma do Cajado (Pipoca)
  | 'boss_homing_projectile'
  | 'boss_beam_segment'
  | 'ufo_projectile'
  | 'alien_spit'
  | 'wisp_bolt' // For Will-O-Wisp
  | 'friction_spark'; // For Friction upgrade

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx?: number;
  vy?: number;
}

export interface Platform extends GameObject {
  type?: 'ground' | 'step';
}

export interface Player extends GameObject {
  stats: PlayerStats;
  isInvulnerable: boolean;
  lastHitTime: number;
  facingDirection: 'left' | 'right';
  selectedStaffId: string;
  selectedAccessoryId?: string;
  isEligibleForRanking: boolean;
  vy: number;
  isOnGround: boolean;
  jumpsLeft: number;
  // For Comet Landing
  apexY?: number; 
  isFalling?: boolean;
  // For Streamer Beam
  beamActive?: boolean;
  beamTargetX?: number;
  beamTargetY?: number;
  // For Wisps
  activeWisps?: ActiveWisp[];
}

export interface ActiveWisp extends GameObject {
  targetX: number;
  targetY: number;
  lastShotTime: number;
  currentAngle?: number; // For orbital movement or aiming
}


export interface Enemy extends GameObject {
  hp: number;
  maxHp: number;
  damage: number;
  projectileDamage?: number;
  speed: number;
  expValue: number;
  lastShotTime?: number;
  shootCooldown?: number;
  type: EnemyType;

  isStunnedUntil?: number;
  isSilencedUntil?: number;
  isCursedUntil?: number;
  curseDps?: number;
  isSlowed?: { multiplier: number; until: number };
  isBoss?: boolean;

  attackPattern?: 'homing_shot' | 'minion_summon' | 'beam_attack' | 'aoe_slam' | 'idle' | 'hover_shoot';
  lastPatternChangeTime?: number;
  patternCooldown?: number;
  patternPhase?: number;
  targetX?: number;
  targetY?: number;
  ufoVerticalDriftDirection?: 1 | -1;

  absoluteTargetX?: number;
  lastAbsoluteTargetXUpdateTime?: number;
  absoluteTargetXUpdateCooldown?: number;

  verticalBobDirection?: 1 | -1;
  lastVerticalBobTime?: number;
  verticalBobCooldown?: number;

  currentBobbingCenterY?: number;
  lastBobbingCenterYUpdateTime?: number;
  bobbingCenterYUpdateCooldown?: number;

  scatterTargetX?: number;
  scatterTargetY?: number;
  isScatteringCooldownUntil?: number;
  playerRelativeTargetX?: number;
  playerRelativeTargetY?: number;
  lastPlayerRelativeTargetUpdateTime?: number;

  isKiting?: boolean;

  alienSpitCooldown?: number;
  lastAlienSpitTime?: number;

  animationState?: 'idle' | 'run' | 'die';
  currentFrame?: number;
  lastFrameUpdateTime?: number;
  facingDirection?: 'left' | 'right';
  isDying?: boolean;
  timeOfDeath?: number;
  spriteSheetUrl?: string;
  spriteFrameWidth?: number;
  spriteFrameHeight?: number;
  spriteTotalColumns?: number;
  animationLoops?: boolean;
  deathAnimationDuration?: number;

  // New fields for new enemy behaviors
  abilityCooldown?: number;
  lastAbilityTime?: number;
  healingTargetId?: string; // For Sentinela Reparadora
  lastHealPulseTime?: number; // For Sentinela Reparadora
  lastHitFlashTime?: number; // For hit flash effect

  // For wound effect logic
  woundAppliedTime?: number;
  woundDamagePerTick?: number;
  woundTicksRemaining?: number;
  lastWoundTickTime?: number;
}

export interface Projectile extends GameObject {
  damage: number;
  isPlayerProjectile: boolean;
  color: string;
  visualType: ProjectileVisualType;
  staffId: string;
  homingTargetId?: string;
  bouncesLeft?: number;
  originalShooterId?: string;
  isFragment?: boolean;
  chainDepth?: number;
  pierceLeft?: number;
  isPipocaSoulFragment?: boolean; // For Alma do Cajado (Pipoca)
  pacManDamageBonus?: number; // For Pac-Man upgrade
  explodesOnImpact?: boolean; // Added for generic projectile explosions
  explosionRadius?: number;   // Added for generic projectile explosions
}

export interface HealingOrb extends GameObject {
  healAmount: number;
  vy: number;
  createdAt: number;
  isOnGround?: boolean;
  groundY?: number;
}

export interface EntropicFragment extends GameObject {
  createdAt: number;
  vy: number;
  isOnGround?: boolean;
  groundY?: number;
}


export interface LeaderboardEntry {
  id?: number;
  name: string;
  total_hours: number;
  rank?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
  duration: number;
  isCrit?: boolean;
  vy?: number;
  vx?: number;
  size?: number;
}

export type TemporaryEffectType =
  | 'lightning_aoe'
  | 'butter_slick'
  | 'radiation_trail'
  | 'explosion_aoe'
  | 'shield_visual'
  | 'boss_aoe_warning'
  | 'boss_beam_visual'
  | 'projectile_trail_particle'
  | 'enemy_death_particles'
  | 'projectile_impact_particles'
  | 'vision_obscure_aoe'      // New
  | 'gravity_well_aoe'        // New
  | 'healing_beam'            // New for Sentinela Reparadora
  | 'meteor_impact_warning'   // New
  | 'meteor_impact_aoe'       // New
  | 'burning_man_aura_visual' // New
  | 'plague_aura_visual'      // New
  | 'black_hole_visual';      // New

export interface TemporaryEffect extends GameObject {
  effectType: TemporaryEffectType;
  duration: number;
  createdAt: number;
  damageOverTime?: number;
  slowAmount?: number;
  damage?: number;
  hitEnemyIds?: Set<string>;
  rotation?: number;
  color?: string;
  particleCount?: number;
  particleSpeed?: number;
  particleSize?: number;
  // For gravity well or black hole
  pullForce?: number;
  // For healing beam
  targetId?: string;
  sourceId?: string;
}

export type KeysPressed = Record<string, boolean>;

export interface GrassBlade {
  id: string;
  baseX: number; // Original X position on the segment
  x: number; // Current X for rendering (might differ from baseX due to wind or effects)
  y: number; // Base Y position on the ground
  height: number;
  width: number;
  initialAngle: number; // Natural lean or rest angle
  currentAngle: number; // Current rendering angle
  targetAngle: number;  // Angle it's trying to reach (due to player or wind)
  lastBentTime: number;
  color: string;
  swayOffset: number; // For varied wind effect timing
  stiffness: number; // How much it resists bending
}

export interface ActiveDynamicEvent {
  type: 'meteor_shower'; // Add other event types here later
  startTime: number;
  duration: number;
  lastMeteorSpawnTime?: number;
}

export type SoundEffectKey =
  | 'player_shoot_magic'
  | 'player_shoot_chinelo'
  | 'player_shoot_pipoca'
  | 'player_shoot_soap'
  | 'player_shoot_plunger'
  | 'player_shoot_slipper'
  | 'player_shoot_chicken'
  | 'player_jump'
  | 'player_land' // Optional, if jump has distinct land sound
  | 'player_hit'
  | 'player_death'
  | 'player_shield_block'
  | 'player_dodge'
  | 'enemy_hit_generic'
  | 'enemy_hit_slime' // Example specific enemy hit
  | 'enemy_death_generic'
  | 'enemy_death_slime' // Example specific enemy death
  | 'enemy_shoot_generic'
  | 'enemy_shoot_ufo'
  | 'enemy_shoot_alien'
  | 'sombra_obscure_cast'
  | 'tecelao_gravity_cast'
  | 'sentinela_heal_cast'
  | 'sentinela_heal_beam_loop' // For continuous beam
  | 'boss_spawn'
  | 'boss_hit'
  | 'boss_death'
  | 'boss_attack_homing'
  | 'boss_attack_beam_charge'
  | 'boss_attack_beam_fire'
  | 'boss_attack_slam_warn'
  | 'boss_attack_slam_impact'
  | 'projectile_bounce'
  | 'projectile_explode'
  | 'projectile_impact_wall' // If projectiles hit boundaries
  | 'orb_collect_heal'
  | 'entropic_fragment_collect'
  | 'upgrade_select'
  | 'level_up'
  | 'wave_start'
  | 'meteor_warn'
  | 'meteor_impact'
  | 'ui_button_click'
  | 'ui_modal_open'
  | 'ui_modal_close'
  | 'game_over_fanfare'
  | 'ambient_music_menu' // Example BGM
  | 'ambient_music_game'
  | 'wisp_shoot' // New
  | 'comet_land_impact' // New
  | 'avenger_revive' // New
  | 'plague_aura_pulse' // New
  | 'burning_man_pulse' // New
  | 'black_hole_form' // New
  | 'streamer_beam_start' // New
  | 'streamer_beam_loop' // New
  | 'streamer_beam_end' // New
  | 'friction_projectile_launch'; // New
  
// Define a structure for upgrades that grant stacks of other upgrades
export interface StackGrant {
  upgradeId: string;
  count: number;
}