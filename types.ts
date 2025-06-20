
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  CARD_SELECTION = 'CARD_SELECTION',
  GAME_OVER = 'GAME_OVER',
}

export enum AccessoryType {
  WIZARD_AMULET = "Amuleto Brilhante do Zé", // ✨
  STURDY_SCAPULAR = "Escapulário da Firmeza", // 🛡️
  GENERIC_ICARUS_FEATHERS = "Penas de Ícaro (Genéricas)", // 🕊️
  TOP_HAT = "Cartola Chique \"Só Filé\"", // 🎩
  TROUBLE_AMULET = "Amuleto da Encrenca", // 🔥
  LENS_OF_INSIGHT = "Lente da Perspicácia", // 🔍
}

export interface Accessory {
  id: string;
  name: AccessoryType;
  description: string;
  icon: string;
  renderStyle: 'on_head' | 'floating_icon';
  effects: {
    statModifiers?: Partial<PlayerStats>;
    maxJumps?: number;
    onlyUncommonOrBetterCards?: boolean;
    challengerDoubleEnemy?: boolean;
    challengerDoubleItemChance?: number;
    fedoraFreeReroll?: boolean;
    fedoraNoRanking?: boolean;
    luckBoost?: number;
  };
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  speed: number;
  attackSpeed: number;
  projectileDamage: number;
  projectileSpeed: number;
  projectileSize: number;
  critChance: number;
  critMultiplier: number;
  luck: number;
  defense: number;
  lifeSteal?: number;
  maxJumps: number;
  currentJumps: number;

  projectilePiercing?: number;
  // projectilesExplode?: boolean; // Replaced by Samba Explosivo logic
  // projectileExplosionRadius?: number; // Replaced by Samba Explosivo logic
  shotPattern?: 'TRIPLE';

  // Card effect flags & timers
  hasThunderCard?: boolean;
  lastThunderStrikeTime?: number;
  thunderInterval?: number;

  hasInfernalPepperCard?: boolean;
  infernalPepperChance?: number;
  infernalPepperDotDamage?: number;
  infernalPepperDotDuration?: number;

  projectileMayReturn?: boolean;
  projectileReturnChance?: number;

  hasSlipperyBananaCard?: boolean;
  lastBananaDropTime?: number;
  bananaDropInterval?: number;
  bananaStunDuration?: number;

  jumpBoostMultiplier?: number;
  soulOrbDropChance?: number;
  soulOrbHealAmount?: number;
  invulnerabilityDurationMultiplier?: number;

  rageModeActive?: boolean;
  rageDamageBonus?: number;
  rageAttackSpeedBonus?: number;
  rageHpThreshold?: number;

  playerSizeMultiplier?: number;

  hasXangoThunder?: boolean;
  lastXangoStrikeTime?: number;
  xangoThunderInterval?: number;
  xangoThunderBolts?: number;
  xangoThunderDamageMultiplier?: number;

  extraCardChoice?: number;

  shieldActive?: boolean;
  shieldMaxCooldown?: number;
  shieldCurrentCooldown?: number;

  bodyContactDamage?: number;

  hasIansaThunder?: boolean;
  lastIansaStrikeTime?: number;
  iansaThunderInterval?: number;
  iansaThunderBolts?: number;
  iansaThunderDamageMultiplier?: number;

  bleedChance?: number;
  bleedDamagePerTick?: number;
  bleedDuration?: number;
  bleedTickInterval?: number;

  frictionMeter?: number;
  frictionThreshold?: number;
  frictionProjectileCount?: number;
  frictionProjectileDamage?: number;

  enemyDeathProjectileCount?: number;
  enemyDeathProjectileDamage?: number;

  wispActive?: boolean;
  wispDamageMultiplier?: number;
  wispAttackSpeedMultiplier?: number;

  // Samba Explosivo Card
  hasSambaExplosivo?: boolean;
  sambaExplosivo_shardCount?: number; // Increases with stacks
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  stats: PlayerStats;
  currentStaff: Staff;
  currentAccessory: Accessory;
  collectedCards: Card[];
  lastShotTime: number;
  isInvulnerable: boolean;
  invulnerabilityEndTime: number;
  vy: number;
  isGrounded: boolean;
  mousePosition: { x: number; y: number };
  availableRerolls: number;
  distanceMovedSinceLastFrictionEffect: number;
  currentAscensionId: string | null;
  activeAscensionEffects: AscensionEffect | null;
}

export enum EnemyType {
  WEAK_FLYER = 'WEAK_FLYER', // Ranged, agile flyer
  TANK_FLYER = 'TANK_FLYER', // Ranged, slow, high HP flyer
  KAMIKAZE = 'KAMIKAZE', // Rushes, explodes (now flying)
}

export interface Enemy extends GameObject {
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number; // Contact damage for melee/kamikaze, or base for projectile calculations
  lastMoveTime?: number;
  targetX?: number;
  targetY?: number;
  isStunned?: boolean;
  stunEndTime?: number;
  activeDoTs?: ActiveDoT[];
  slowMultiplier?: number;

  isFlying?: boolean; 
  shootCooldown?: number;
  lastShotTime?: number;
  enemyProjectileType?: ProjectileVisualType; 
  enemyProjectileSpeed?: number;
  enemyProjectileDamage?: number; 
  kamikazeExplosionRadius?: number;
  kamikazeDamage?: number; 
  preferredDistanceMin?: number; 
  preferredDistanceMax?: number; 
  originalY?: number; 
  oscillationAngle?: number; 
  
  isSilenced?: boolean; // For Pantufa do Vovô
  silenceEndTime?: number;

  isSambaExplosionSource?: boolean; // Temp flag for chain reaction
  vulnerabilityMultiplier?: number; // For Galinha de Macumba curse
  vulnerabilityEndTime?: number;
}

export interface ActiveDoT {
  id: string;
  type: 'infernalPepper' | 'bleed' | 'generic_dot' | 'fire_trail_dot' | 'macumba_curse_dot';
  sourceCardId: string; 
  sourceStaffId?: string; // For staff-based DoTs like Macumba Chicken
  damagePerTick: number;
  tickInterval: number;
  remainingDuration: number;
  lastTickTime: number;
}


export interface Projectile extends GameObject {
  dx: number;
  dy: number;
  speed: number;
  damage: number;
  isPlayerProjectile: boolean;
  color: string;
  visualType: ProjectileVisualType;
  rotation?: number;
  homingTargetId?: string;
  isCrit?: boolean;
  piercing?: number;
  piercingCount?: number;
  explodesOnImpact?: boolean; // For initial Samba projectile explosion
  explosionRadius?: number; // For initial Samba projectile explosion
  isReturning?: boolean;
  hasHit?: boolean;
  isFiery?: boolean;
  sourceStaffId?: string;
  duration?: number;
  startTime?: number;
  isFrictionFire?: boolean;
  isEnemyDeathProjectile?: boolean;
  originalDamage?: number; 

  // Samba Explosivo
  isSambaShard?: boolean;

  // Galinha de Macumba
  bouncesRemaining?: number;

  // Secador de Cabelo
  pushbackForce?: number;
}

export enum CardRarity {
  COMMON = 'Comum',
  UNCOMMON = 'Incomum',
  EPIC = 'Épico',
  ASCENSION = 'Ascensão',
}

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: CardRarity;
  icon: string;
  maxStacks?: number; 
  applyEffect: (player: Player, isChallengerDoubled: boolean | null, allCards: Card[]) => Partial<PlayerStats> | void;
}

export enum StaffType {
  WIZARD = 'Cajado de Mago',
  CHINELO = 'Chinelo Teleguiado da Mamãe',
  PIPOCA = 'Canhão de Pipoca',
  VARINHA_MEIA_BOCA = "Varinha de Condão Meia-Boca",
  RODO_MAGICO = "Rodo Mágico Limpa-Tudo", // Will be projectile based
  DESENTUPIDOR_CELESTIAL = "Desentupidor Celestial",
  PANTUFA_VOVO = "Pantufa do Vovô",
  SECADOR_FURACAO = "Secador de Cabelo Furacão",
  GALINHA_MACUMBA = "Galinha de Macumba",
}

export type ProjectileType = 'NORMAL' | 'HOMING' | 'SHOTGUN' | 'SWIPE' | 'STICKY' | 'AOE_ON_IMPACT' | 'BOUNCING';

export type ProjectileVisualType =
  'magic_bolt' | 'slipper' | 'popcorn_kernel' | 'circle' |
  'sparkle' | 'swipe_arc' | 'plunger' | 'fire_trail' |
  'enemy_pipoca' | 'enemy_bolt' | 'enemy_large_bolt' |
  'samba_shard_green' | 'soap_bubble' | 'grandpas_slipper' |
  'hot_air_puff' | 'macumba_chicken_proj';

export interface Staff {
  id: string;
  name: StaffType;
  description: string;
  baseDamage: number;
  baseAttackSpeed: number; // Lower is faster
  projectileType: ProjectileType;
  projectileVisualType: ProjectileVisualType;
  projectileCount?: number; // For shotgun type or multi-shot like secador
  projectileSpread?: number; // For shotgun type
  icon: string;
  // Specific staff properties
  aoeRadiusOnImpact?: number; // For Rodo Mágico
  silenceChance?: number; // For Pantufa do Vovô
  silenceDuration?: number; // For Pantufa do Vovô
  pushbackForcePerHit?: number; // For Secador
  maxBounces?: number; // For Galinha de Macumba
  curseChance?: number; // For Galinha de Macumba
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  textureType?: 'ground' | 'floating_stone';
}

export interface LeaderboardEntry {
  id:string; // Can be a timestamp or a unique ID from the backend
  playerName: string;
  playerState: string; // UF
  score: number;
  wave: number;
  durationMinutes: number;
  date: string; // "dd/mm/yyyy"
}

export interface TemporaryVisualEffect {
  id: string;
  type: 'lightning' | 'banana_peel' | 'kamikaze_explosion' | 'projectile_explosion' | 'explosion_particle' | 'soul_orb' | 'shield_effect' | 'floating_accessory_effect' | 'screen_flash' | 'fire_trail' | 'screen_static' | 'ascension_notification' | 'samba_projectile_explosion' | 'samba_enemy_explosion';
  x: number;
  y: number;
  width?: number;
  height?: number;
  startTime: number;
  duration: number;
  color?: string;
  icon?: string;
  text?: string;
  targetObjectId?: string;
  accessoryIcon?: string;
  particleSpeedX?: number; 
  particleSpeedY?: number; 
  zIndex?: number;
}

export interface Wisp extends GameObject {
  ownerId: string;
  attackCooldown: number;
  lastAttackTime: number;
  damage: number;
}

// --- Ascensions ---
export interface AscensionTriggerCondition {
  cardIds: string[];
}

export interface AscensionEffect {
  visualForm?: string; 
  hasFireTrail?: boolean;
  damageBoost?: number; 
  auraColor?: string; 
}

export interface Ascension {
  id: string;
  name: string;
  description: string;
  icon: string; 
  trigger: AscensionTriggerCondition;
  effects: AscensionEffect;
}
