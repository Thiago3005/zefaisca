
import { Card, CardRarity, Staff, StaffType, PlayerStats, Player, Platform, Accessory, AccessoryType, EnemyType, ProjectileVisualType, Ascension, AscensionTriggerCondition, AscensionEffect } from './types';

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 700;
export const PLAYER_INITIAL_HP = 100;
export const PLAYER_SPEED = 3;

export const PLAYER_BODY_WIDTH = 28;
export const PLAYER_BODY_HEIGHT = 38;
export const PLAYER_HAT_HEIGHT = 22;
export const PLAYER_BEARD_HEIGHT = 15;
export const PLAYER_BEARD_WIDTH = PLAYER_BODY_WIDTH - 4;
export const PLAYER_VISUAL_OFFSET_Y = 0;

export const PLAYER_SIZE = PLAYER_BODY_WIDTH;

export const PLAYER_ATTACK_SPEED = 500; // Lower is faster
export const PLAYER_PROJECTILE_SPEED = 5;
export const PLAYER_PROJECTILE_DAMAGE = 10;
export const PLAYER_PROJECTILE_SIZE = 8;
export const INVULNERABILITY_DURATION = 1000;

export const SLIPPER_PROJECTILE_WIDTH = 12;
export const SLIPPER_PROJECTILE_HEIGHT = 25;
export const POPCORN_PROJECTILE_SIZE = 10;
export const MAGIC_BOLT_WIDTH = 8;
export const MAGIC_BOLT_HEIGHT = 16;
export const PLUNGER_PROJECTILE_WIDTH = 15;
export const PLUNGER_PROJECTILE_HEIGHT = 15;
export const SOAP_BUBBLE_SIZE = 12;
export const GRANDPAS_SLIPPER_WIDTH = 25;
export const GRANDPAS_SLIPPER_HEIGHT = 15;
export const HOT_AIR_PUFF_SIZE = 6;
export const MACUMBA_CHICKEN_SIZE = 20;


export const GRAVITY = 0.7;
export const JUMP_STRENGTH = -14;
export const MAX_FALL_SPEED = 12;

export const ENEMY_SPAWN_INTERVAL = 2000;
export const WAVE_BREAK_DURATION = 3000;

export const ENEMY_DEFAULT_PROJECTILE_SIZE = 10;
export const ENEMY_DEFAULT_PROJECTILE_SPEED = 3;
export const ENEMY_DEFAULT_PROJECTILE_DAMAGE = 5;
export const ENEMY_DEFAULT_PROJECTILE_COLOR = '#FF4136'; // Red
export const ENEMY_WEAK_FLYER_PROJECTILE_VISUAL: ProjectileVisualType = 'enemy_bolt';
export const ENEMY_TANK_FLYER_PROJECTILE_VISUAL: ProjectileVisualType = 'enemy_large_bolt';


interface EnemyBaseStatsConfig {
  hp: number;
  speed: number;
  damage: number; 
  width: number;
  height: number;
  color: string;
  isFlying: boolean;
  shootCooldown?: number;
  enemyProjectileType?: ProjectileVisualType;
  enemyProjectileSpeed?: number;
  enemyProjectileDamage?: number;
  kamikazeExplosionRadius?: number;
  kamikazeDamage?: number;
  preferredDistanceMin?: number;
  preferredDistanceMax?: number;
}

export const ENEMY_STATS: Record<EnemyType, EnemyBaseStatsConfig> = {
  [EnemyType.WEAK_FLYER]: {
    hp: 35, speed: 1.3, damage: 0, width: 25, height: 25, color: '#63B3ED', isFlying: true,
    shootCooldown: 2500, enemyProjectileType: ENEMY_WEAK_FLYER_PROJECTILE_VISUAL,
    enemyProjectileSpeed: 3.5, enemyProjectileDamage: 8,
    preferredDistanceMin: 150, preferredDistanceMax: 300,
  },
  [EnemyType.TANK_FLYER]: {
    hp: 120, speed: 0.7, damage: 0, width: 40, height: 40, color: '#38A169', isFlying: true,
    shootCooldown: 3500, enemyProjectileType: ENEMY_TANK_FLYER_PROJECTILE_VISUAL,
    enemyProjectileSpeed: 2.5, enemyProjectileDamage: 12,
    preferredDistanceMin: 250, preferredDistanceMax: 500,
  },
  [EnemyType.KAMIKAZE]: {
    hp: 25, speed: 2.5, damage: 25, width: 28, height: 28, color: '#DD6B20', isFlying: true,
    kamikazeExplosionRadius: 75, kamikazeDamage: 35,
  }
};


export const INITIAL_PLAYER_STATS: PlayerStats = {
  hp: PLAYER_INITIAL_HP,
  maxHp: PLAYER_INITIAL_HP,
  speed: PLAYER_SPEED,
  attackSpeed: PLAYER_ATTACK_SPEED,
  projectileDamage: PLAYER_PROJECTILE_DAMAGE,
  projectileSpeed: PLAYER_PROJECTILE_SPEED,
  projectileSize: PLAYER_PROJECTILE_SIZE,
  critChance: 0.05,
  critMultiplier: 1.5,
  luck: 1,
  defense: 0,
  lifeSteal: 0,
  maxJumps: 1,
  currentJumps: 1,

  hasThunderCard: false,
  lastThunderStrikeTime: 0,
  hasInfernalPepperCard: false,
  hasSlipperyBananaCard: false,
  lastBananaDropTime: 0,

  jumpBoostMultiplier: 1.0,
  soulOrbDropChance: 0,
  soulOrbHealAmount: 0,
  invulnerabilityDurationMultiplier: 1.0,
  rageHpThreshold: 0.5,
  playerSizeMultiplier: 1.0,

  hasXangoThunder: false,
  lastXangoStrikeTime: 0,
  xangoThunderBolts: 2,
  xangoThunderInterval: 6000,
  xangoThunderDamageMultiplier: 1.5,

  extraCardChoice: 0,

  shieldActive: false,
  shieldMaxCooldown: 15000,
  shieldCurrentCooldown: 0,

  bodyContactDamage: 0,

  hasIansaThunder: false,
  lastIansaStrikeTime: 0,
  iansaThunderBolts: 5,
  iansaThunderInterval: 5000,
  iansaThunderDamageMultiplier: 2.5,

  bleedChance: 0,
  bleedDamagePerTick: 0,
  bleedDuration: 0,
  bleedTickInterval: 1000,

  frictionMeter: 0,
  frictionThreshold: 5,
  frictionProjectileCount: 1,
  frictionProjectileDamage: 5,

  enemyDeathProjectileCount: 0,
  enemyDeathProjectileDamage: 3,

  wispActive: false,
  wispDamageMultiplier: 0.25,
  wispAttackSpeedMultiplier: 0.25,

  hasSambaExplosivo: false,
  sambaExplosivo_shardCount: 0,
};

// Samba Explosivo Constants
export const SAMBA_PROJECTILE_EXPLOSION_RADIUS_BASE = 50;
export const SAMBA_PROJECTILE_AOE_DAMAGE_MULTIPLIER = 0.5; 
export const SAMBA_ENEMY_DEATH_SHARD_COUNT_BASE = 3; // Base shards added per card
export const SAMBA_SHARD_DAMAGE_MULTIPLIER = 0.3; 
export const SAMBA_ENEMY_DEATH_EXPLOSION_RADIUS = 60;
export const SAMBA_ENEMY_DEATH_AOE_DAMAGE_MULTIPLIER = 0.25; 
export const SAMBA_SHARD_VISUAL_TYPE: ProjectileVisualType = 'samba_shard_green';
export const SAMBA_SHARD_SIZE = 6;
export const SAMBA_SHARD_SPEED = 4.5; // Slightly faster shards

export const STAFF_DEFINITIONS: Staff[] = [
  {
    id: 'staff_wizard',
    name: StaffType.WIZARD,
    description: 'Dispara um projétil mágico em linha reta. O feijão com arroz dos magos.',
    baseDamage: 0, 
    baseAttackSpeed: 0, 
    projectileType: 'NORMAL',
    projectileVisualType: 'magic_bolt',
    icon: '🪄',
  },
  {
    id: 'staff_chinelo',
    name: StaffType.CHINELO,
    description: 'Arremessa um chinelo teleguiado que causa alto dano. Mais lento, mas certeiro.',
    baseDamage: 10,
    baseAttackSpeed: 300, 
    projectileType: 'HOMING',
    projectileVisualType: 'slipper',
    icon: '🩴',
  },
  {
    id: 'staff_pipoca',
    name: StaffType.PIPOCA,
    description: 'Dispara caroços de pipoca que explodem em múltiplos projéteis (tipo shotgun). Uma verdadeira chuva de milho!',
    baseDamage: -5, 
    baseAttackSpeed: 100, 
    projectileType: 'SHOTGUN',
    projectileVisualType: 'popcorn_kernel',
    projectileCount: 5,
    projectileSpread: 0.5,
    icon: '🍿',
  },
  {
    id: 'staff_meia_boca',
    name: StaffType.VARINHA_MEIA_BOCA,
    description: 'Solta faíscas que mais fazem cócegas do que machucam. Pelo menos é brilhante!',
    baseDamage: -8,
    baseAttackSpeed: -100, 
    projectileType: 'NORMAL',
    projectileVisualType: 'sparkle',
    icon: '✨',
  },
  {
    id: 'staff_rodo_magico',
    name: StaffType.RODO_MAGICO,
    description: 'Lança Bolas de Sabão que estouram causando dano em área. Limpeza profunda nos inimigos!',
    baseDamage: -2, 
    baseAttackSpeed: 150, 
    projectileType: 'AOE_ON_IMPACT',
    projectileVisualType: 'soap_bubble',
    aoeRadiusOnImpact: 40,
    icon: '🧹',
  },
  {
    id: 'staff_desentupidor',
    name: StaffType.DESENTUPIDOR_CELESTIAL,
    description: 'Lança um desentupidor que gruda no inimigo, causando constrangimento e uma breve paralisia.',
    baseDamage: 1,
    baseAttackSpeed: 400, 
    projectileType: 'STICKY',
    projectileVisualType: 'plunger',
    icon: '🚽',
  },
  {
    id: 'staff_pantufa_vovo',
    name: StaffType.PANTUFA_VOVO,
    description: "Lança uma pantufa tão poderosa que pode calar a boca de qualquer um (literalmente). Dano massivo, mas leeeenta. 20% chance de silenciar por 2s.",
    baseDamage: 25, 
    baseAttackSpeed: 700, 
    projectileType: 'NORMAL',
    projectileVisualType: 'grandpas_slipper',
    silenceChance: 0.20,
    silenceDuration: 2000,
    icon: '👟', 
  },
  {
    id: 'staff_secador_furacao',
    name: StaffType.SECADOR_FURACAO,
    description: "Solta um fluxo contínuo de ar quente que mais parece um vendaval. Empurra os inimigos e causa dano leve, mas constante.",
    baseDamage: -7, 
    baseAttackSpeed: -250, 
    projectileType: 'NORMAL', 
    projectileVisualType: 'hot_air_puff',
    projectileCount: 1, 
    pushbackForcePerHit: 0.5,
    icon: '💇‍♀️', 
  },
  {
    id: 'staff_galinha_macumba',
    name: StaffType.GALINHA_MACUMBA,
    description: "Arremessa uma galinha consagrada que quica loucamente, causando dano e aplicando uma mandinga aleatória a cada quicada (máx 5 quicadas). 50% chance de amaldiçoar!",
    baseDamage: 5, 
    baseAttackSpeed: 200, 
    projectileType: 'BOUNCING',
    projectileVisualType: 'macumba_chicken_proj',
    maxBounces: 5,
    curseChance: 0.5,
    icon: '🐔',
  },
];

export const ACCESSORY_DEFINITIONS: Accessory[] = [
  {
    id: 'acc_wizard_amulet',
    name: AccessoryType.WIZARD_AMULET,
    description: "Um amuleto que emana uma aura mística. Dizem que atrai coisas boas (e energúmenos).",
    icon: '✨',
    renderStyle: 'floating_icon',
    effects: { luckBoost: 5 },
  },
  {
    id: 'acc_sturdy_scapular',
    name: AccessoryType.STURDY_SCAPULAR,
    description: "Feito de couro de capivara curtido. Pesado, mas protege que é uma beleza!",
    icon: '🛡️',
    renderStyle: 'floating_icon',
    effects: { statModifiers: { defense: 0.30, speed: INITIAL_PLAYER_STATS.speed * -0.15 } },
  },
  {
    id: 'acc_icarus_feathers',
    name: AccessoryType.GENERIC_ICARUS_FEATHERS,
    description: "Um par de penas celestiais de segunda mão. Permitem um saltito extra no ar.",
    icon: '🕊️',
    renderStyle: 'floating_icon',
    effects: { maxJumps: 2 },
  },
  {
    id: 'acc_top_hat',
    name: AccessoryType.TOP_HAT,
    description: "Com esta belezinha, só aparece carta da boa. Esqueça as tranqueiras comuns!",
    icon: '🎩',
    renderStyle: 'on_head',
    effects: { onlyUncommonOrBetterCards: true },
  },
  {
    id: 'acc_trouble_amulet',
    name: AccessoryType.TROUBLE_AMULET,
    description: "Este amuleto parece atrair confusão! Mais cartas na mão, mas o dobro de encrenca!",
    icon: '🔥',
    renderStyle: 'floating_icon',
    effects: { challengerDoubleEnemy: true, challengerDoubleItemChance: 0.20 },
  },
  {
    id: 'acc_lens_of_insight',
    name: AccessoryType.LENS_OF_INSIGHT,
    description: "Uma lente especial que permite uma segunda olhada nas cartas. Mas seu nome não vai pro placar!",
    icon: '🔍',
    renderStyle: 'floating_icon',
    effects: { fedoraFreeReroll: true, fedoraNoRanking: true },
  },
];

const applyChallengerDoubleToValue = (value: number, isChallengerDoubled: boolean | null): number => {
  return isChallengerDoubled ? value * 2 : value;
};
const applyChallengerDoubleToPercentage = (value: number, isChallengerDoubled: boolean | null): number => {
  return isChallengerDoubled ? Math.min(1, value * 2) : value;
};


export const CARD_DEFINITIONS: Card[] = [
  {
    id: 'card_hp_up_common_base',
    name: 'Vigor Renovado',
    description: '+20 HP Máximo. Cura em 20 HP. O básico pra não virar presunto.',
    rarity: CardRarity.COMMON,
    icon: '❤️',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => {
      const hpToAdd = applyChallengerDoubleToValue(20, isChallengerDoubled);
      const newMaxHp = player.stats.maxHp + hpToAdd;
      const currentHp = Math.min(newMaxHp, player.stats.hp + hpToAdd);
      return { maxHp: newMaxHp, hp: currentHp };
    },
  },
  {
    id: 'card_speed_up_common_base',
    name: 'Pés Ligeiros',
    description: '+10% Velocidade de Movimento. "Sai da frente, Gordinho!"',
    rarity: CardRarity.COMMON,
    icon: '👟',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => ({ speed: player.stats.speed * (1 + applyChallengerDoubleToPercentage(0.1, isChallengerDoubled)) }),
  },
  {
    id: 'card_damage_up_common_base',
    name: 'Força Bruta',
    description: '+2 Dano de Projétil. Pra dar aquele "chega pra lá".',
    rarity: CardRarity.COMMON,
    icon: '💪',
    maxStacks: 10,
    applyEffect: (player, isChallengerDoubled) => ({ projectileDamage: player.stats.projectileDamage + applyChallengerDoubleToValue(2, isChallengerDoubled) }),
  },
  {
    id: 'card_atk_speed_common_base',
    name: 'Mãos Rápidas',
    description: '+15% Velocidade de Ataque. Mais rápido que coceira de macaco.',
    rarity: CardRarity.COMMON,
    icon: '⚡',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => ({ attackSpeed: player.stats.attackSpeed * (1 - applyChallengerDoubleToPercentage(0.15, isChallengerDoubled)) }),
  },
  {
    id: 'card_crit_chance_uncommon_base',
    name: 'Olho de Águia',
    description: '+10% Chance de Crítico. "Acertei na mosca, varejeira!"',
    rarity: CardRarity.UNCOMMON,
    icon: '🎯',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => ({ critChance: Math.min(1, player.stats.critChance + applyChallengerDoubleToPercentage(0.1, isChallengerDoubled)) }),
  },
  {
    id: 'card_piercing_uncommon_base',
    name: 'Flecha Perfurante',
    description: 'Projéteis atravessam +1 inimigo. Entra por um ouvido e sai pelo outro.',
    rarity: CardRarity.UNCOMMON,
    icon: ' xuyên ', 
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => {
      return { projectilePiercing: (player.stats.projectilePiercing || 0) + applyChallengerDoubleToValue(1, isChallengerDoubled) };
    },
  },
   {
    id: 'card_projectile_size_uncommon_base',
    name: 'Projéteis Grandes',
    description: '+25% Tamanho do Projétil. "Que que é isso, meu Deus?!"',
    rarity: CardRarity.UNCOMMON,
    icon: '💣',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ projectileSize: player.stats.projectileSize * (1 + applyChallengerDoubleToPercentage(0.25, isChallengerDoubled)) }),
  },
   {
    id: 'card_galinha_bumerangue_uncommon_base',
    name: 'Galinha de Borracha Bumerangue',
    description: 'Projéteis têm 25% de chance de retornar. "Pó pópó... cuidado com a cabeça!"',
    rarity: CardRarity.UNCOMMON,
    icon: '🐔',
    maxStacks: 1, 
    applyEffect: (player, isChallengerDoubled) => {
      return { projectileMayReturn: true, projectileReturnChance: applyChallengerDoubleToPercentage(0.25, isChallengerDoubled) };
    }
  },
  {
    id: 'card_samba_explosivo_epic_base',
    name: 'Samba Explosivo',
    description: `Projéteis explodem e inimigos derrotados por Samba liberam estilhaços verdes. Cada carta aumenta o número de estilhaços em +${SAMBA_ENEMY_DEATH_SHARD_COUNT_BASE}. Cause o caos! "É o Tchan no Carnaval!"`,
    rarity: CardRarity.EPIC,
    icon: '🥁',
    // No maxStacks for unlimited chaos!
    applyEffect: (player, isChallengerDoubled) => {
      let newShardCount = player.stats.sambaExplosivo_shardCount || 0;
      newShardCount += SAMBA_ENEMY_DEATH_SHARD_COUNT_BASE * (isChallengerDoubled ? 2 : 1);
      
      return {
        hasSambaExplosivo: true,
        sambaExplosivo_shardCount: newShardCount,
      };
    },
  },
  {
    id: 'card_multi_shot_epic_base',
    name: 'Tiro Triplo',
    description: 'Dispara 3 projéteis em leque. "Um é pouco, dois é bom, três é DEMAIS!"',
    rarity: CardRarity.EPIC,
    icon: '🔱',
    maxStacks: 1,
    applyEffect: (player) => {
      return { shotPattern: 'TRIPLE' };
    },
  },
  {
    id: 'card_furia_de_tupa_epic_base',
    name: 'Fúria de Tupã',
    description: 'A cada 3-5s, um raio cai num inimigo (200% dano). "Tupã tá pistola!"',
    rarity: CardRarity.EPIC,
    icon: '🌩️',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => {
      return {
        hasThunderCard: true,
        thunderInterval: isChallengerDoubled ? 2000 : 4000,
        lastThunderStrikeTime: Date.now()
      };
    }
  },
  {
    id: 'card_pimenta_infernal_epic_base',
    name: 'Pimenta Malagueta Infernal',
    description: 'Projéteis têm 30% chance de causar dano flamejante (15/s por 3s). "Queima, quengaral!"',
    rarity: CardRarity.EPIC,
    icon: '🌶️',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => {
      return {
        hasInfernalPepperCard: true,
        infernalPepperChance: applyChallengerDoubleToPercentage(0.3, isChallengerDoubled),
        infernalPepperDotDamage: applyChallengerDoubleToValue(15, isChallengerDoubled),
        infernalPepperDotDuration: 3000
      };
    }
  },
  {
    id: 'card_banana_escorregadia_uncommon_base',
    name: 'Banana Escorregadia',
    description: 'A cada 10s, Zé derruba uma casca de banana. Inimigos escorregam e ficam atordoados. "É uma armadilha, Bino!"',
    rarity: CardRarity.UNCOMMON,
    icon: '🍌',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => {
      return {
        hasSlipperyBananaCard: true,
        bananaDropInterval: isChallengerDoubled ? 7000 : 10000,
        lastBananaDropTime: Date.now(),
        bananaStunDuration: applyChallengerDoubleToValue(2000, isChallengerDoubled),
      };
    }
  },
  {
    id: 'card_oleo_de_peroba',
    name: 'Óleo de Peroba',
    description: '+2 Dano. Pra sua cara de pau e pros seus projéteis também!',
    rarity: CardRarity.COMMON,
    icon: '🧴',
    maxStacks: 10,
    applyEffect: (player, isChallengerDoubled) => ({ projectileDamage: player.stats.projectileDamage + applyChallengerDoubleToValue(2, isChallengerDoubled) }),
  },
  {
    id: 'card_olhar_43',
    name: 'Olhar 43',
    description: '+5% Chance de Crítico. Aquele olhar que derrete... os inimigos, claro.',
    rarity: CardRarity.COMMON,
    icon: '👀',
    maxStacks: 10,
    applyEffect: (player, isChallengerDoubled) => ({ critChance: Math.min(1, player.stats.critChance + applyChallengerDoubleToPercentage(0.05, isChallengerDoubled)) }),
  },
  {
    id: 'card_canja_de_galinha',
    name: 'Canja de Galinha',
    description: '+10 HP Máximo e cura 10 HP. Porque não faz mal a ninguém.',
    rarity: CardRarity.COMMON,
    icon: '🥣',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => {
      const hpBoost = applyChallengerDoubleToValue(10, isChallengerDoubled);
      return { maxHp: player.stats.maxHp + hpBoost, hp: Math.min(player.stats.maxHp + hpBoost, player.stats.hp + hpBoost) };
    }
  },
  {
    id: 'card_pulo_do_gato',
    name: 'Pulo do Gato',
    description: 'Pulos são 20% mais altos. "Miau!" Cuidado pra não cair de cabeça.',
    rarity: CardRarity.COMMON,
    icon: '🐈',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ jumpBoostMultiplier: (player.stats.jumpBoostMultiplier || 1) * (1 + applyChallengerDoubleToPercentage(0.2, isChallengerDoubled)) }),
  },
  {
    id: 'card_benzedura_rapida',
    name: 'Benzedura Rápida',
    description: 'Cura 30% do HP perdido. "Sai, zica! Xô, capeta!"',
    rarity: CardRarity.COMMON,
    icon: '🙏',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => {
      const healPercent = applyChallengerDoubleToPercentage(0.3, isChallengerDoubled);
      const missingHp = player.stats.maxHp - player.stats.hp;
      return { hp: Math.min(player.stats.maxHp, player.stats.hp + missingHp * healPercent) };
    }
  },
  {
    id: 'card_couro_grosso',
    name: 'Couro Grosso',
    description: '+4% Defesa. "Pode bater, Zé aguenta o tranco!"',
    rarity: CardRarity.COMMON,
    icon: '🛡️',
    maxStacks: 10,
    applyEffect: (player, isChallengerDoubled) => ({ defense: Math.min(0.9, player.stats.defense + applyChallengerDoubleToPercentage(0.04, isChallengerDoubled)) }),
  },
  {
    id: 'card_cafe_reforcado',
    name: 'Café Reforçado',
    description: '+12% Velocidade de Ataque. "Zé tá ligadão no 220v!"',
    rarity: CardRarity.COMMON,
    icon: '☕',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => ({ attackSpeed: player.stats.attackSpeed * (1 - applyChallengerDoubleToPercentage(0.12, isChallengerDoubled)) }),
  },
  {
    id: 'card_moedinha_da_sorte',
    name: 'Moedinha da Sorte',
    description: 'Inimigos têm 2% de chance de dropar uma moedinha que cura 1 HP. De grão em grão...',
    rarity: CardRarity.COMMON,
    icon: '🪙',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => ({
      soulOrbDropChance: (player.stats.soulOrbDropChance || 0) + applyChallengerDoubleToPercentage(0.02, isChallengerDoubled),
      soulOrbHealAmount: Math.max(1, (player.stats.soulOrbHealAmount || 0) + applyChallengerDoubleToValue(0, isChallengerDoubled)) || 1,
    }),
  },
  {
    id: 'card_pe_na_bunda',
    name: 'Pé na Bunda',
    description: '+20% Velocidade de Movimento. "Corre, Zé, que a véia tá vindo!"',
    rarity: CardRarity.COMMON,
    icon: '🏃',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ speed: player.stats.speed * (1 + applyChallengerDoubleToPercentage(0.2, isChallengerDoubled)) }),
  },
  {
    id: 'card_azeite_extra_virgem',
    name: 'Azeite Extra Virgem',
    description: '+4 Dano. Refinado, que nem o Zé antes da cachaça.',
    rarity: CardRarity.UNCOMMON,
    icon: '🫒',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => ({ projectileDamage: player.stats.projectileDamage + applyChallengerDoubleToValue(4, isChallengerDoubled) }),
  },
  {
    id: 'card_sumidouro_magico',
    name: 'Sumidouro Mágico',
    description: '+20% Duração da invulnerabilidade pós-dano. "Cadê o Zé? Sumiu!"',
    rarity: CardRarity.UNCOMMON,
    icon: '💨',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ invulnerabilityDurationMultiplier: (player.stats.invulnerabilityDurationMultiplier || 1) * (1 + applyChallengerDoubleToPercentage(0.2, isChallengerDoubled)) }),
  },
  {
    id: 'card_feijoada_completa',
    name: 'Feijoada Completa',
    description: '+20 HP Máximo e cura 20 HP. "Sustança pra aguentar o rojão!"',
    rarity: CardRarity.UNCOMMON,
    icon: '🥘',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => {
      const hpBoost = applyChallengerDoubleToValue(20, isChallengerDoubled);
      return { maxHp: player.stats.maxHp + hpBoost, hp: Math.min(player.stats.maxHp + hpBoost, player.stats.hp + hpBoost) };
    }
  },
  {
    id: 'card_asas_de_barata',
    name: 'Asas de Barata',
    description: '+1 Pulo Extra. Meio nojento, mas pelo menos voa (um pouquinho).',
    rarity: CardRarity.UNCOMMON,
    icon: '🪳',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ maxJumps: player.stats.maxJumps + applyChallengerDoubleToValue(1, isChallengerDoubled) }),
  },
  {
    id: 'card_sanguessuga_camarada',
    name: 'Sanguessuga Camarada',
    description: '3% Roubo de Vida. "Pega só um pouquinho pra ajudar, valeu?"',
    rarity: CardRarity.UNCOMMON,
    icon: '🩸',
    maxStacks: 5,
    applyEffect: (player, isChallengerDoubled) => ({ lifeSteal: (player.stats.lifeSteal || 0) + applyChallengerDoubleToPercentage(0.03, isChallengerDoubled) }),
  },
  {
    id: 'card_patua_reforcado',
    name: 'Patuá Reforçado',
    description: '+10 Sorte. "Xô, uruca! Esse aqui é benzido!"',
    rarity: CardRarity.UNCOMMON,
    icon: '🍀',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ luck: player.stats.luck + applyChallengerDoubleToValue(10, isChallengerDoubled) }),
  },
  {
    id: 'card_pastelzinho_curativo',
    name: 'Pastelzinho Curativo',
    description: 'Inimigos têm 5% de chance de dropar um pastel que cura 5 HP. "Com caldo de cana!"',
    rarity: CardRarity.UNCOMMON,
    icon: '🥟',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({
      soulOrbDropChance: (player.stats.soulOrbDropChance || 0) + applyChallengerDoubleToPercentage(0.05, isChallengerDoubled),
      soulOrbHealAmount: (player.stats.soulOrbHealAmount || 0) + applyChallengerDoubleToValue(5, isChallengerDoubled),
    }),
  },
  {
    id: 'card_na_mosca',
    name: 'Na Mosca!',
    description: 'Críticos causam +50% de dano extra. "Bem no meio do... onde quer que seja!"',
    rarity: CardRarity.UNCOMMON,
    icon: '💯',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ critMultiplier: player.stats.critMultiplier + applyChallengerDoubleToPercentage(0.5, isChallengerDoubled) }),
  },
  {
    id: 'card_ze_pistola',
    name: 'Zé Pistola',
    description: 'Abaixo de 50% HP: +25% Dano de Projétil, +25% Vel. Ataque. "Agora o pau vai torar!"',
    rarity: CardRarity.UNCOMMON,
    icon: '😠',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => ({
      rageModeActive: true,
      rageDamageBonus: (player.stats.rageDamageBonus || 0) + applyChallengerDoubleToPercentage(0.25, isChallengerDoubled),
      rageAttackSpeedBonus: (player.stats.rageAttackSpeedBonus || 0) + applyChallengerDoubleToPercentage(0.25, isChallengerDoubled),
      rageHpThreshold: 0.5,
    }),
  },
  {
    id: 'card_energetico_turbinado',
    name: 'Energético Turbinado',
    description: '+24% Velocidade de Ataque. "Zé virou o Flash com refluxo!"',
    rarity: CardRarity.UNCOMMON,
    icon: '🚀',
    maxStacks: 3,
    applyEffect: (player, isChallengerDoubled) => ({ attackSpeed: player.stats.attackSpeed * (1 - applyChallengerDoubleToPercentage(0.24, isChallengerDoubled)) }),
  },
  {
    id: 'card_encolhedor_tabajara',
    name: 'Encolhedor Tabajara',
    description: 'Zé fica 10% menor. Mais difícil de acertar (e de alcançar a cachaça na prateleira de cima).',
    rarity: CardRarity.UNCOMMON,
    icon: '🤏',
    maxStacks: 2,
    applyEffect: (player, isChallengerDoubled) => ({ playerSizeMultiplier: (player.stats.playerSizeMultiplier || 1) * (1 - applyChallengerDoubleToPercentage(0.1, isChallengerDoubled)) }),
  },
  {
    id: 'card_chamado_de_xango',
    name: 'Chamado de Xangô',
    description: 'Invoca 2 raios nos inimigos a cada 5-7s (150% dano). "Kaô Kabecilê!"',
    rarity: CardRarity.UNCOMMON,
    icon: '⚒️',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => ({
      hasXangoThunder: true,
      xangoThunderInterval: isChallengerDoubled ? 4000 : 6000,
      xangoThunderBolts: 2,
      xangoThunderDamageMultiplier: 1.5, // Base multiplier for this card
      lastXangoStrikeTime: Date.now(),
    }),
  },
  {
    id: 'card_olho_clinico',
    name: 'Olho Clínico',
    description: '+1 Opção de Carta nas escolhas futuras. "Hmm, interessante..."',
    rarity: CardRarity.EPIC,
    icon: '🧐',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => ({ extraCardChoice: (player.stats.extraCardChoice || 0) + applyChallengerDoubleToValue(1, isChallengerDoubled) }),
  },
  {
    id: 'card_escudo_de_sao_jorge',
    name: 'Escudo de São Jorge',
    description: 'Cria um escudo que bloqueia UM ataque a cada 15 segundos. "Eu andarei vestido e armado..."',
    rarity: CardRarity.EPIC,
    icon: '🛡️✨',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => ({
      shieldActive: true, // Initially active
      shieldMaxCooldown: isChallengerDoubled ? 10000 : 15000,
      shieldCurrentCooldown: 0, // Starts ready
    }),
  },
  {
    id: 'card_corpo_em_chamas_literalmente',
    name: 'Corpo em Chamas (Literalmente)',
    description: 'Seu corpo causa 20 de dano de contato. "Não encosta, senão queima!"',
    rarity: CardRarity.EPIC,
    icon: '🔥🧍',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => ({ bodyContactDamage: (player.stats.bodyContactDamage || 0) + applyChallengerDoubleToValue(20, isChallengerDoubled) }),
  },
  {
    id: 'card_ira_de_iansa',
    name: 'Ira de Iansã',
    description: 'Invoca 5 raios poderosos nos inimigos a cada 4-6s (250% dano). "Eparrey, Iansã!"',
    rarity: CardRarity.EPIC,
    icon: '🌪️⚡',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => ({
      hasIansaThunder: true,
      iansaThunderInterval: isChallengerDoubled ? 3000 : 5000,
      iansaThunderBolts: applyChallengerDoubleToValue(5,isChallengerDoubled),
      iansaThunderDamageMultiplier: 2.5, // Base multiplier for this card
      lastIansaStrikeTime: Date.now(),
    }),
  },
  {
    id: 'card_manual_do_ze_vol1',
    name: 'Manual do Zé (Vol. 1)',
    description: 'Receba imediatamente os efeitos de 3 cartas Comuns aleatórias. Conhecimento é poder (e gambiarra)!',
    rarity: CardRarity.EPIC,
    icon: '📜',
    maxStacks: 1, 
    applyEffect: (player, isChallengerDoubled, allCards) => {
      const commonCards = allCards.filter(c => c.rarity === CardRarity.COMMON && c.id !== 'card_manual_do_ze_vol1');
      let combinedStats: Partial<PlayerStats> = {};
      for (let i = 0; i < (isChallengerDoubled ? 6 : 3); i++) {
        if (commonCards.length === 0) break;
        const randomCard = commonCards[Math.floor(Math.random() * commonCards.length)];
        const tempPlayer = { ...player, stats: { ...player.stats, ...combinedStats } };
        const effect = randomCard.applyEffect(tempPlayer, false, allCards); 
        if (effect && typeof effect === 'object') {
          for (const key in effect) {
            const statKey = key as keyof PlayerStats;
            const effectValue = (effect as any)[statKey];
            const baseValue = (player.stats as any)[statKey]; 
            const currentValueInCombined = (combinedStats as any)[statKey];

            if (typeof effectValue === 'number') {
                if (typeof currentValueInCombined === 'number') {
                     (combinedStats as any)[statKey] += (effectValue - (baseValue || 0) );
                } else if (typeof baseValue === 'number') {
                    (combinedStats as any)[statKey] = baseValue + (effectValue - baseValue);
                }
                 else {
                    (combinedStats as any)[statKey] = effectValue;
                }
            } else if (typeof effectValue === 'boolean') {
                (combinedStats as any)[statKey] = effectValue;
            } else {
                (combinedStats as any)[statKey] = effectValue;
            }
          }
        }
      }
        if (combinedStats.maxHp !== undefined) {
            const maxHpIncrease = combinedStats.maxHp - (player.stats.maxHp || INITIAL_PLAYER_STATS.maxHp);
            combinedStats.maxHp = (player.stats.maxHp || INITIAL_PLAYER_STATS.maxHp) + maxHpIncrease;
            if (combinedStats.hp !== undefined) {
                 const hpIncrease = combinedStats.hp - (player.stats.hp || INITIAL_PLAYER_STATS.hp);
                 combinedStats.hp = Math.min(combinedStats.maxHp, (player.stats.hp || INITIAL_PLAYER_STATS.hp) + hpIncrease);
            } else {
                 combinedStats.hp = Math.min(combinedStats.maxHp, (player.stats.hp || INITIAL_PLAYER_STATS.hp) + maxHpIncrease);
            }
        } else if (combinedStats.hp !== undefined) {
            const hpIncrease = combinedStats.hp - (player.stats.hp || INITIAL_PLAYER_STATS.hp);
            combinedStats.hp = Math.min((player.stats.maxHp || INITIAL_PLAYER_STATS.maxHp), (player.stats.hp || INITIAL_PLAYER_STATS.hp) + hpIncrease);
        }
      return combinedStats;
    },
  },
  {
    id: 'card_corte_de_tercado',
    name: 'Corte de Terçado',
    description: 'Projéteis têm 20% de chance de causar sangramento (5 dano/s por 3s). "Talho de peixeira!"',
    rarity: CardRarity.EPIC,
    icon: '🔪🩸',
    maxStacks: 1,
    applyEffect: (player, isChallengerDoubled) => ({
      bleedChance: (player.stats.bleedChance || 0) + applyChallengerDoubleToPercentage(0.2, isChallengerDoubled),
      bleedDamagePerTick: (player.stats.bleedDamagePerTick || 0) + applyChallengerDoubleToValue(5, isChallengerDoubled),
      bleedDuration: 3000,
      bleedTickInterval: 1000,
    }),
  },
];

export const ASCENSION_DEFINITIONS: Ascension[] = [
  {
    id: 'asc_exu_soul',
    name: "Alma Ígnea de Exu",
    description: "O calor infernal de Exu flui por Zé! Dano aumentado, e ele deixa um rastro de fogo por onde passa.",
    icon: '🔥🔱',
    trigger: {
      cardIds: ['card_pimenta_infernal_epic_base', 'card_corpo_em_chamas_literalmente'],
    },
    effects: {
      visualForm: 'igneous_exu',
      hasFireTrail: true,
      damageBoost: 0.20,
      auraColor: 'rgba(255, 100, 0, 0.4)',
    }
  }
];


export const MAX_LEADERBOARD_ENTRIES = 10;
export const LOCAL_STORAGE_LEADERBOARD_KEY = 'zeFaiscaLeaderboard';

export const PLATFORMS: Platform[] = [
  { id: 'p_ground_main', x: 0, y: GAME_HEIGHT - 40, width: GAME_WIDTH, height: 40, textureType: 'ground' },
  { id: 'p_float_1', x: 100, y: GAME_HEIGHT - 170, width: 180, height: 25, textureType: 'floating_stone' }, // Lowered
  { id: 'p_float_2', x: GAME_WIDTH - 280, y: GAME_HEIGHT - 190, width: 180, height: 25, textureType: 'floating_stone' }, // Lowered
  { id: 'p_float_3', x: GAME_WIDTH/2 - 100, y: GAME_HEIGHT - 280, width: 200, height: 25, textureType: 'floating_stone' }, // Lowered
  { id: 'p_float_4', x: 300, y: GAME_HEIGHT - 380, width: 150, height: 20, textureType: 'floating_stone' }, // Lowered
  { id: 'p_float_5', x: GAME_WIDTH - 450, y: GAME_HEIGHT - 380, width: 150, height: 20, textureType: 'floating_stone' }, // Lowered
  { id: 'p_float_6', x: 50, y: GAME_HEIGHT - 480, width: 200, height: 20, textureType: 'floating_stone' }, // Lowered
  { id: 'p_float_7', x: GAME_WIDTH - 250, y: GAME_HEIGHT - 480, width: 200, height: 20, textureType: 'floating_stone' }, // Lowered
];

export const BRAZILIAN_STATES = [
  { name: 'Acre', abbr: 'AC' }, { name: 'Alagoas', abbr: 'AL' }, { name: 'Amapá', abbr: 'AP' },
  { name: 'Amazonas', abbr: 'AM' }, { name: 'Bahia', abbr: 'BA' }, { name: 'Ceará', abbr: 'CE' },
  { name: 'Distrito Federal', abbr: 'DF' }, { name: 'Espírito Santo', abbr: 'ES' }, { name: 'Goiás', abbr: 'GO' },
  { name: 'Maranhão', abbr: 'MA' }, { name: 'Mato Grosso', abbr: 'MT' }, { name: 'Mato Grosso do Sul', abbr: 'MS' },
  { name: 'Minas Gerais', abbr: 'MG' }, { name: 'Pará', abbr: 'PA' }, { name: 'Paraíba', abbr: 'PB' },
  { name: 'Paraná', abbr: 'PR' }, { name: 'Pernambuco', abbr: 'PE' }, { name: 'Piauí', abbr: 'PI' },
  { name: 'Rio de Janeiro', abbr: 'RJ' }, { name: 'Rio Grande do Norte', abbr: 'RN' }, { name: 'Rio Grande do Sul', abbr: 'RS' },
  { name: 'Rondônia', abbr: 'RO' }, { name: 'Roraima', abbr: 'RR' }, { name: 'Santa Catarina', abbr: 'SC' },
  { name: 'São Paulo', abbr: 'SP' }, { name: 'Sergipe', abbr: 'SE' }, { name: 'Tocantins', abbr: 'TO' }
];

export const THUNDER_DAMAGE_MULTIPLIER = 2;
export const THUNDER_VISUAL_DURATION = 350;
export const THUNDER_BOLT_THICKNESS = 15;

export const SCREEN_FLASH_DURATION = 100;

export const EXPLOSION_PARTICLE_COUNT = 10;
export const EXPLOSION_PARTICLE_SIZE_MIN = 3;
export const EXPLOSION_PARTICLE_SIZE_MAX = 7;
export const EXPLOSION_PARTICLE_SPEED_MIN = 1;
export const EXPLOSION_PARTICLE_SPEED_MAX = 4;
export const EXPLOSION_PARTICLE_DURATION = 500;

export const SCREEN_SHAKE_DURATION_SHORT = 150;
export const SCREEN_SHAKE_INTENSITY_LOW = 4;

export const BANANA_PEEL_WIDTH = 20;
export const BANANA_PEEL_HEIGHT = 10;
export const BANANA_PEEL_DURATION = 8000;
export const BANANA_ICON = '🍌';

export const PLUNGER_STUN_DURATION = 1500;

export const SPARKLE_PROJECTILE_SIZE = 5;
export const SPARKLE_PROJECTILE_SPEED_MULTIPLIER = 0.5;

export const SOUL_ORB_SIZE = 12;
export const SOUL_ORB_DURATION = 10000;
export const SOUL_ORB_COLOR = '#FFD700';
export const SOUL_ORB_ICON = '🪙';

export const SHIELD_VISUAL_DURATION = 200;
export const SHIELD_COLOR_ACTIVE = 'rgba(0, 150, 255, 0.3)';
export const SHIELD_COLOR_BROKEN = 'rgba(255, 0, 0, 0.3)';

export const PIXELS_PER_METER = 50;
export const FRICTION_FIRE_WIDTH = 15;
export const FRICTION_FIRE_HEIGHT = 25;
export const FRICTION_FIRE_DURATION = 1000;
export const FRICTION_FIRE_SPEED = 2;

export const ENEMY_DEATH_PROJECTILE_SIZE = 8;
export const ENEMY_DEATH_PROJECTILE_SPEED = 3;
export const ENEMY_DEATH_PROJECTILE_COLOR = '#ff8c00';

export const FLOATING_ACCESSORY_SIZE = 20;
export const FLOATING_ACCESSORY_OFFSET_X = PLAYER_BODY_WIDTH / 2 + 5;
export const FLOATING_ACCESSORY_OFFSET_Y = -15;
export const FLOATING_ACCESSORY_OPACITY = 0.75;
export const ON_HEAD_ACCESSORY_FONT_SIZE_MULTIPLIER = 1.2;

export const COLLECTED_CARDS_UI_MAX_ICON_SIZE = 24;
export const COLLECTED_CARDS_UI_BG_OPACITY = 0.7;
export const COLLECTED_CARDS_UI_STACK_FONT_SIZE = '10px';

export const KAMIKAZE_EXPLOSION_VISUAL_DURATION = 400;
export const KAMIKAZE_EXPLOSION_COLOR = 'rgba(255, 100, 0, 0.7)';
export const SAMBA_EXPLOSION_COLOR_PROJECTILE = 'rgba(0, 220, 100, 0.7)';
export const SAMBA_EXPLOSION_COLOR_ENEMY = 'rgba(50, 255, 150, 0.8)';
export const SAMBA_SHARD_COLOR = '#00FF7F'; 

export const FIRE_TRAIL_WIDTH = PLAYER_BODY_WIDTH * 0.8;
export const FIRE_TRAIL_HEIGHT = 10;
export const FIRE_TRAIL_DURATION = 2000;
export const FIRE_TRAIL_DAMAGE_PER_TICK = 2;
export const FIRE_TRAIL_TICK_INTERVAL = 500;
export const FIRE_TRAIL_OPACITY_START = 0.6;

export const SCREEN_STATIC_DURATION = 300;
export const ANOMALY_CHANCE = 0.0001;

export const ASCENSION_NOTIFICATION_DURATION = 3000;
export const ASCENSION_NOTIFICATION_TEXT_COLOR = '#FFD700';
export const ASCENSION_NOTIFICATION_BG_COLOR = 'rgba(50, 0, 100, 0.8)';
