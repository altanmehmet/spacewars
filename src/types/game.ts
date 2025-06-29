export interface Planet {
  id: string;
  x: number;
  y: number;
  size: PlanetSize;
  owner: Player | null;
  soldierCount: number;
  maxSoldiers: number;
  productionRate: number;
  lastProductionTime: number;
  specialType?: PlanetSpecialType; // Özel gezegen türü
  specialBonus?: number; // Özel bonus değeri
}

// Özel gezegen türleri
export enum PlanetSpecialType {
  NORMAL = 'normal',           // Normal gezegen
  ENERGY = 'energy',           // ⚡ Enerji gezegeni - 2x üretim
  FORTRESS = 'fortress',       // 🛡️ Kale gezegeni - %50 savunma bonusu
  FACTORY = 'factory',         // 🏭 Fabrika gezegeni - komşulara üretim bonusu
  RARE = 'rare'               // 💎 Nadir gezegen - büyük kapasite, yavaş üretim
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isAI: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

export enum PlanetSize {
  TINY = 'tiny',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  HUGE = 'huge'
}

export enum AttackPercentage {
  TWENTY_FIVE = 25,
  FIFTY = 50,
  HUNDRED = 100
}

export interface GameState {
  planets: Planet[];
  players: Player[];
  currentPlayer: Player;
  gamePhase: GamePhase;
  selectedPlanets: Planet[];
  targetPlanet: Planet | null;
  gameTime: number;
  isGameOver: boolean;
  winner: Player | null;
  level: number;
  levelCompleted: boolean;
  username: string;
  gameStartTime: number;
  spaceships: Spaceship[];
  attackAnimations: AttackAnimation[];
}

export enum GamePhase {
  SELECTION = 'selection',
  MULTI_SELECTION = 'multi_selection',
  ATTACK = 'attack',
  GAME_OVER = 'game_over',
  LEVEL_COMPLETE = 'level_complete'
}

export interface AttackAction {
  fromPlanets: Planet[];
  toPlanet: Planet;
  percentage: AttackPercentage;
}

export interface LevelConfig {
  level: number;
  planetCount: number;
  aiPlayers: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  aiThinkingTime: number;
}

export interface ScoreEntry {
  username: string;
  level: number;
  completedLevels: number;
  totalTime: number;
  date: string;
}

// Uzay gemisi animasyonları için yeni tipler
export interface Spaceship {
  id: string;
  planetId: string;
  isAttacking: boolean;
  targetPlanetId?: string;
  startTime?: number;
  startX?: number;
  startY?: number;
  targetX?: number;
  targetY?: number;
  angle: number;
  orbitAngle?: number; // Yörünge açısı
  status: 'orbiting' | 'attacking' | 'moving'; // Gemi durumu
}

export interface AttackAnimation {
  id: string;
  fromPlanetId: string;
  toPlanetId: string;
  startTime: number;
  duration: number;
  attackingShipIds: string[]; // Saldırıya katılan gemi ID'leri
  soldiers: number; // Kaç asker taşıyor
} 