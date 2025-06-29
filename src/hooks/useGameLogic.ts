import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  GameState, 
  Planet, 
  Player, 
  PlanetSize, 
  PlanetSpecialType,
  GamePhase, 
  AttackPercentage,
  AttackAction,
  LevelConfig,
  ScoreEntry,
  Spaceship,
  AttackAnimation
} from '../types/game';
import { saveScore } from '../utils/scoreManager';

const PRODUCTION_INTERVAL = 1000; // 1 saniye
const GAME_TICK_INTERVAL = 100; // 100ms

const PLANET_CONFIGS = {
  [PlanetSize.TINY]: {
    maxSoldiers: 30,
    productionRate: 1,
    radius: 15
  },
  [PlanetSize.SMALL]: {
    maxSoldiers: 60,
    productionRate: 2,
    radius: 20
  },
  [PlanetSize.MEDIUM]: {
    maxSoldiers: 100,
    productionRate: 3,
    radius: 30
  },
  [PlanetSize.LARGE]: {
    maxSoldiers: 150,
    productionRate: 4,
    radius: 40
  },
  [PlanetSize.HUGE]: {
    maxSoldiers: 220,
    productionRate: 5,
    radius: 50
  }
};

// Özel gezegen türü konfigürasyonları
const SPECIAL_PLANET_CONFIGS = {
  [PlanetSpecialType.NORMAL]: {
    productionMultiplier: 1,
    defenseBonus: 0,
    capacityMultiplier: 1,
    neighborBonus: 0
  },
  [PlanetSpecialType.ENERGY]: {
    productionMultiplier: 2, // ⚡ 2x üretim
    defenseBonus: 0,
    capacityMultiplier: 1,
    neighborBonus: 0
  },
  [PlanetSpecialType.FORTRESS]: {
    productionMultiplier: 1,
    defenseBonus: 0.5, // 🛡️ %50 savunma bonusu
    capacityMultiplier: 1.3, // %30 daha fazla kapasite
    neighborBonus: 0
  },
  [PlanetSpecialType.FACTORY]: {
    productionMultiplier: 1,
    defenseBonus: 0,
    capacityMultiplier: 1,
    neighborBonus: 1 // 🏭 Komşulara +1 üretim bonusu
  },
  [PlanetSpecialType.RARE]: {
    productionMultiplier: 0.5, // 💎 Yavaş üretim
    defenseBonus: 0,
    capacityMultiplier: 2, // 2x kapasite
    neighborBonus: 0
  }
};

// AI renkleri - 7 AI'ye kadar
const AI_COLORS = [
  '#F44336', // Kırmızı
  '#9C27B0', // Mor
  '#3F51B5', // Mavi
  '#FF9800', // Turuncu
  '#795548', // Kahverengi
  '#607D8B', // Gri-mavi
  '#E91E63', // Pembe
  '#00BCD4', // Açık mavi
  '#4CAF50', // Yeşil (oyuncudan farklı ton)
  '#FFEB3B', // Sarı
  '#009688', // Teal
  '#8BC34A', // Açık yeşil
];

// Bölüm konfigürasyonları - 20 bölüm ile daha zor progresyon
const LEVEL_CONFIGS: LevelConfig[] = [
  // Kolay bölümler (1-5) - ama artık daha dengeli
  { level: 1, planetCount: 6, aiPlayers: 1, aiDifficulty: 'easy', aiThinkingTime: 2500 },
  { level: 2, planetCount: 7, aiPlayers: 1, aiDifficulty: 'medium', aiThinkingTime: 2200 },
  { level: 3, planetCount: 8, aiPlayers: 1, aiDifficulty: 'medium', aiThinkingTime: 2000 },
  { level: 4, planetCount: 9, aiPlayers: 2, aiDifficulty: 'medium', aiThinkingTime: 1800 },
  { level: 5, planetCount: 10, aiPlayers: 2, aiDifficulty: 'hard', aiThinkingTime: 1600 },
  
  // Orta zorluk bölümler (6-10) - daha agresif
  { level: 6, planetCount: 11, aiPlayers: 2, aiDifficulty: 'hard', aiThinkingTime: 1500 },
  { level: 7, planetCount: 12, aiPlayers: 2, aiDifficulty: 'hard', aiThinkingTime: 1400 },
  { level: 8, planetCount: 13, aiPlayers: 3, aiDifficulty: 'hard', aiThinkingTime: 1300 },
  { level: 9, planetCount: 14, aiPlayers: 3, aiDifficulty: 'hard', aiThinkingTime: 1200 },
  { level: 10, planetCount: 15, aiPlayers: 3, aiDifficulty: 'hard', aiThinkingTime: 1100 },
  
  // Zor bölümler (11-15) - çok agresif
  { level: 11, planetCount: 16, aiPlayers: 3, aiDifficulty: 'hard', aiThinkingTime: 1000 },
  { level: 12, planetCount: 17, aiPlayers: 4, aiDifficulty: 'hard', aiThinkingTime: 900 },
  { level: 13, planetCount: 18, aiPlayers: 4, aiDifficulty: 'hard', aiThinkingTime: 800 },
  { level: 14, planetCount: 19, aiPlayers: 4, aiDifficulty: 'hard', aiThinkingTime: 700 },
  { level: 15, planetCount: 20, aiPlayers: 4, aiDifficulty: 'hard', aiThinkingTime: 600 },
  
  // Çok zor bölümler (16-20) - imkansıza yakın
  { level: 16, planetCount: 22, aiPlayers: 5, aiDifficulty: 'hard', aiThinkingTime: 500 },
  { level: 17, planetCount: 24, aiPlayers: 5, aiDifficulty: 'hard', aiThinkingTime: 400 },
  { level: 18, planetCount: 26, aiPlayers: 6, aiDifficulty: 'hard', aiThinkingTime: 300 },
  { level: 19, planetCount: 28, aiPlayers: 6, aiDifficulty: 'hard', aiThinkingTime: 250 },
  { level: 20, planetCount: 30, aiPlayers: 7, aiDifficulty: 'hard', aiThinkingTime: 200 }, // Final boss!
];

// Gezegenlerin çakışmaması için minimum mesafe kontrolü
const isPositionValid = (x: number, y: number, existingPlanets: Planet[]): boolean => {
  const minDistance = 70; // Biraz daha az mesafe - daha fazla gezegen için
  
  for (const planet of existingPlanets) {
    const distance = Math.sqrt(Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2));
    if (distance < minDistance) {
      return false;
    }
  }
  return true;
};

// Güvenli pozisyon bulma
const findSafePosition = (existingPlanets: Planet[]): { x: number; y: number } => {
  let attempts = 0;
  const maxAttempts = 200; // Daha fazla deneme
  
  while (attempts < maxAttempts) {
    const x = 80 + Math.random() * 640; // Biraz daha dar alan
    const y = 80 + Math.random() * 440;
    
    if (isPositionValid(x, y, existingPlanets)) {
      return { x, y };
    }
    attempts++;
  }
  
  // Eğer güvenli pozisyon bulunamazsa, rastgele bir pozisyon döndür
  return {
    x: 80 + Math.random() * 640,
    y: 80 + Math.random() * 440
  };
};

// Oyuncuları oluştur
const createPlayers = (username: string, aiCount: number): Player[] => {
  const players: Player[] = [
    { id: '1', name: username, color: '#4CAF50', isAI: false }
  ];
  
  // AI oyuncuları ekle
  for (let i = 0; i < aiCount; i++) {
    const aiId = (i + 2).toString();
    const aiName = `AI ${i + 1}`;
    const aiColor = AI_COLORS[i % AI_COLORS.length];
    
    players.push({
      id: aiId,
      name: aiName,
      color: aiColor,
      isAI: true,
      aiDifficulty: 'medium'
    });
  }
  
  return players;
};

// Gezegen oluşturma fonksiyonu
const generatePlanets = (count: number, players: Player[], level: number): Planet[] => {
  const planets: Planet[] = [];
  
  for (let i = 0; i < count; i++) {
    let size: PlanetSize;
    let owner: Player | null = null;
    
    // Oyuncu gezegeni - seviyeye göre boyut
    if (i === 0) {
      if (level <= 3) {
        size = PlanetSize.MEDIUM; // İlk 3 bölümde orta boyut
      } else if (level <= 8) {
        size = PlanetSize.LARGE; // 4-8 arası büyük
      } else if (level <= 15) {
        size = PlanetSize.MEDIUM; // 9-15 arası tekrar orta (daha zor)
      } else {
        size = PlanetSize.SMALL; // Son bölümlerde küçük (çok zor!)
      }
      owner = players[0]; // Oyuncu
    }
    // AI oyuncular - seviyeye göre güçlenirler
    else if (i <= players.length - 1) {
      if (level <= 2) {
        // İlk 2 bölüm: AI'lar küçük gezegenle başlar
        size = PlanetSize.TINY;
      } else if (level <= 5) {
        // 3-5 bölüm: AI'lar küçük/orta gezegenle başlar
        const aiSizes = [PlanetSize.TINY, PlanetSize.SMALL];
        size = aiSizes[Math.floor(Math.random() * aiSizes.length)];
      } else if (level <= 10) {
        // 6-10 bölüm: AI'lar küçük/orta/büyük gezegenle başlar
        const aiSizes = [PlanetSize.SMALL, PlanetSize.MEDIUM];
        size = aiSizes[Math.floor(Math.random() * aiSizes.length)];
      } else if (level <= 15) {
        // 11-15 bölüm: AI'lar orta/büyük gezegenle başlar
        const aiSizes = [PlanetSize.MEDIUM, PlanetSize.LARGE];
        size = aiSizes[Math.floor(Math.random() * aiSizes.length)];
      } else {
        // 16+ bölüm: AI'lar büyük/devasa gezegenle başlar (çok zor!)
        const aiSizes = [PlanetSize.LARGE, PlanetSize.HUGE];
        size = aiSizes[Math.floor(Math.random() * aiSizes.length)];
      }
      owner = players[i];
    }
    // Kalan gezegenler - seviyeye göre daha büyük gezegenler
    else {
      if (level <= 5) {
        // İlk 5 bölüm: çoğunlukla küçük gezegenler
        const weightedSizes = [
          ...Array(5).fill(PlanetSize.TINY),      // %38
          ...Array(4).fill(PlanetSize.SMALL),     // %31
          ...Array(2).fill(PlanetSize.MEDIUM),    // %15
          ...Array(1).fill(PlanetSize.LARGE),     // %8
          ...Array(1).fill(PlanetSize.HUGE)       // %8
        ];
        size = weightedSizes[Math.floor(Math.random() * weightedSizes.length)];
      } else if (level <= 10) {
        // 6-10 bölüm: daha dengeli dağılım
        const weightedSizes = [
          ...Array(3).fill(PlanetSize.TINY),      // %25
          ...Array(3).fill(PlanetSize.SMALL),     // %25
          ...Array(3).fill(PlanetSize.MEDIUM),    // %25
          ...Array(2).fill(PlanetSize.LARGE),     // %17
          ...Array(1).fill(PlanetSize.HUGE)       // %8
        ];
        size = weightedSizes[Math.floor(Math.random() * weightedSizes.length)];
      } else {
        // 11+ bölüm: daha büyük gezegenler ağırlıklı
        const weightedSizes = [
          ...Array(2).fill(PlanetSize.TINY),      // %17
          ...Array(2).fill(PlanetSize.SMALL),     // %17
          ...Array(3).fill(PlanetSize.MEDIUM),    // %25
          ...Array(3).fill(PlanetSize.LARGE),     // %25
          ...Array(2).fill(PlanetSize.HUGE)       // %17
        ];
        size = weightedSizes[Math.floor(Math.random() * weightedSizes.length)];
      }
      owner = null;
    }
    
    const config = PLANET_CONFIGS[size];
    
    // Özel gezegen türü belirle (sadece tarafsız gezegenler için)
    const specialType = owner ? PlanetSpecialType.NORMAL : getRandomSpecialType(level);
    const specialConfig = SPECIAL_PLANET_CONFIGS[specialType];
    
    // Özel türe göre özellikleri ayarla
    const finalMaxSoldiers = Math.floor(config.maxSoldiers * specialConfig.capacityMultiplier);
    const baseProductionRate = config.productionRate;
    
    // Güvenli pozisyon bul
    const position = findSafePosition(planets);
    
    const planet: Planet = {
      id: `planet-${level}-${i}`,
      x: position.x,
      y: position.y,
      size,
      owner,
      soldierCount: 0, // Tüm oyuncular 0 askerle başlar
      maxSoldiers: finalMaxSoldiers,
      productionRate: baseProductionRate,
      lastProductionTime: Date.now(),
      specialType,
      specialBonus: specialConfig.defenseBonus
    };
    
    planets.push(planet);
  }
  
  return planets;
};

// Oyun başlatma fonksiyonu
const initializeGame = (level: number = 1, username: string = 'Oyuncu'): GameState => {
  const levelConfig = LEVEL_CONFIGS.find(l => l.level === level) || LEVEL_CONFIGS[0];
  
  const players: Player[] = createPlayers(username, levelConfig.aiPlayers);
  const planets: Planet[] = generatePlanets(levelConfig.planetCount, players, level);

  return {
    planets,
    players,
    currentPlayer: players[0],
    gamePhase: GamePhase.SELECTION,
    selectedPlanets: [], // Boş array olarak başlat
    targetPlanet: null,
    gameTime: 0,
    isGameOver: false,
    winner: null,
    level,
    levelCompleted: false,
    username,
    gameStartTime: Date.now(),
    spaceships: [],
    attackAnimations: []
  };
};

// AI stratejisi - birden fazla AI için - gelişmiş strateji
const makeAIMove = (gameState: GameState): AttackAction | null => {
  const currentAIPlayer = gameState.currentPlayer;
  if (!currentAIPlayer.isAI) return null;

  const aiPlanets = gameState.planets.filter(p => p.owner?.id === currentAIPlayer.id);
  const enemyPlanets = gameState.planets.filter(p => p.owner?.id !== currentAIPlayer.id && p.owner !== null);
  const neutralPlanets = gameState.planets.filter(p => p.owner === null);

  // Eğer AI'nin hiç gezegeni yoksa hamle yapamaz
  if (aiPlanets.length === 0) return null;

  // En güçlü AI gezegenini bul
  const bestSource = aiPlanets.reduce((best, current) => 
    current.soldierCount > best.soldierCount ? current : best
  );

  // Daha agresif minimum asker sayısı - erken bölümlerde bile saldırsınlar
  const level = gameState.level;
  const minSoldiersToAttack = level <= 3 ? 3 : level <= 8 ? 4 : level <= 15 ? 3 : 2;
  
  // Eğer en güçlü gezegende bile yeterli asker yoksa hamle yapma
  if (bestSource.soldierCount < minSoldiersToAttack) return null;

  // AI zorluğuna göre strateji belirle - daha erken zorluk artışı
  const aiDifficulty = currentAIPlayer.aiDifficulty || 'medium';
  
  // Hedef seçim stratejisi - daha akıllı hedefleme
  let targets: Planet[] = [];
  
  if (level <= 3) {
    // İlk 3 bölümde bile oyuncuyu hedefle
    const playerPlanets = enemyPlanets.filter(p => p.owner?.id === '1');
    targets = neutralPlanets.length > 2 ? neutralPlanets : [...neutralPlanets, ...playerPlanets];
  } else if (level <= 8) {
    // 4-8 bölüm: oyuncuya öncelik ver
    const playerPlanets = enemyPlanets.filter(p => p.owner?.id === '1');
    const otherAIPlanets = enemyPlanets.filter(p => p.owner?.id !== '1');
    targets = [...neutralPlanets, ...playerPlanets, ...otherAIPlanets];
  } else {
    // Yüksek bölümlerde çok agresif - en zayıf hedefleri öncelikle
    const allTargets = [...neutralPlanets, ...enemyPlanets];
    targets = allTargets.sort((a, b) => {
      // Oyuncunun gezegenlerine öncelik ver
      const aIsPlayer = a.owner?.id === '1' ? -50 : 0;
      const bIsPlayer = b.owner?.id === '1' ? -50 : 0;
      
      // Özel gezegen türlerine göre öncelik ver
      let aSpecialBonus = 0;
      let bSpecialBonus = 0;
      
      if (a.specialType === PlanetSpecialType.ENERGY) aSpecialBonus = -20; // Enerji gezegenlerine öncelik
      if (a.specialType === PlanetSpecialType.FACTORY) aSpecialBonus = -15; // Fabrika gezegenlerine öncelik
      if (a.specialType === PlanetSpecialType.FORTRESS) aSpecialBonus = +10; // Kale gezegenlerinden kaçın
      
      if (b.specialType === PlanetSpecialType.ENERGY) bSpecialBonus = -20;
      if (b.specialType === PlanetSpecialType.FACTORY) bSpecialBonus = -15;
      if (b.specialType === PlanetSpecialType.FORTRESS) bSpecialBonus = +10;
      
      return (a.soldierCount + aIsPlayer + aSpecialBonus) - (b.soldierCount + bIsPlayer + bSpecialBonus);
    });
  }
  
  if (targets.length === 0) return null;

  // En iyi hedefi seç - daha akıllı seçim
  let target: Planet;
  
  if (aiDifficulty === 'hard' || level > 3) {
    // Zor AI veya 4+ bölüm - stratejik hedef seçimi
    target = targets.reduce((best, current) => {
      const bestDistance = Math.sqrt(Math.pow(best.x - bestSource.x, 2) + Math.pow(best.y - bestSource.y, 2));
      const currentDistance = Math.sqrt(Math.pow(current.x - bestSource.x, 2) + Math.pow(current.y - bestSource.y, 2));
      
      // Oyuncunun gezegenlerine bonus ver
      const bestPlayerBonus = best.owner?.id === '1' ? -30 : 0;
      const currentPlayerBonus = current.owner?.id === '1' ? -30 : 0;
      
      // Mesafe, güç ve oyuncu bonusu dengesini hesapla
      const bestScore = (bestDistance / 2) + best.soldierCount + bestPlayerBonus;
      const currentScore = (currentDistance / 2) + current.soldierCount + currentPlayerBonus;
      
      return currentScore < bestScore ? current : best;
    });
  } else {
    // Normal AI - en yakın hedefi seç
    target = targets.reduce((closest, current) => {
      const closestDistance = Math.sqrt(Math.pow(closest.x - bestSource.x, 2) + Math.pow(closest.y - bestSource.y, 2));
      const currentDistance = Math.sqrt(Math.pow(current.x - bestSource.x, 2) + Math.pow(current.y - bestSource.y, 2));
      return currentDistance < closestDistance ? current : closest;
    });
  }
  
  // Saldırı yüzdesi - daha agresif
  let attackPercentage = AttackPercentage.FIFTY;
  
  if (aiDifficulty === 'hard') {
    if (level > 15) {
      // Son bölümlerde çok agresif
      attackPercentage = bestSource.soldierCount > target.soldierCount * 1.2 ? AttackPercentage.HUNDRED : AttackPercentage.FIFTY;
    } else if (level > 8) {
      attackPercentage = bestSource.soldierCount > target.soldierCount * 1.5 ? AttackPercentage.HUNDRED : AttackPercentage.FIFTY;
    } else if (level > 3) {
      attackPercentage = bestSource.soldierCount > target.soldierCount * 2 ? AttackPercentage.HUNDRED : AttackPercentage.FIFTY;
    } else {
      attackPercentage = AttackPercentage.FIFTY;
    }
  } else if (aiDifficulty === 'medium') {
    if (level > 8) {
      attackPercentage = bestSource.soldierCount > target.soldierCount * 1.5 ? AttackPercentage.HUNDRED : AttackPercentage.FIFTY;
    } else if (level > 3) {
      attackPercentage = bestSource.soldierCount > target.soldierCount * 2 ? AttackPercentage.HUNDRED : AttackPercentage.FIFTY;
    } else {
      attackPercentage = AttackPercentage.FIFTY;
    }
  } else {
    attackPercentage = level > 5 ? AttackPercentage.FIFTY : AttackPercentage.TWENTY_FIVE;
  }
  
  // Saldırı gücü kontrolü - hedefe yetecek askeri var mı?
  const attackingForce = Math.floor(bestSource.soldierCount * (attackPercentage / 100));
  if (attackingForce <= target.soldierCount && level > 2) {
    // Yetersizse daha büyük saldırı yap (3+ bölümlerden itibaren)
    attackPercentage = AttackPercentage.HUNDRED;
  }
  
  return {
    fromPlanets: [bestSource],
    toPlanet: target,
    percentage: attackPercentage
  };
};

// Uzay gemisi yönetimi fonksiyonları
const generateSpaceships = (planets: Planet[], existingSpaceships: Spaceship[] = []): Spaceship[] => {
  const allShips: Spaceship[] = [];
  
  planets.forEach(planet => {
    if (planet.owner) {
      const targetShipCount = Math.min(Math.floor(planet.soldierCount / 5), 20); // Her 5 asker için 1 gemi, max 20
      
      // Bu gezegen için mevcut gemileri bul
      const currentShips = existingSpaceships.filter(ship => 
        ship.planetId === planet.id && ship.status === 'orbiting'
      );
      
      // Eğer gemi sayısı az ise yeni gemiler ekle
      if (currentShips.length < targetShipCount) {
        const newShipsNeeded = targetShipCount - currentShips.length;
        
        // Mevcut gemileri koru
        allShips.push(...currentShips);
        
        // Yeni gemiler ekle
        for (let i = 0; i < newShipsNeeded; i++) {
          const shipIndex = currentShips.length + i;
          const baseAngle = (shipIndex * 360) / targetShipCount;
          
          allShips.push({
            id: `ship-${planet.id}-${Date.now()}-${i}`,
            planetId: planet.id,
            isAttacking: false,
            angle: baseAngle,
            orbitAngle: baseAngle,
            status: 'orbiting'
          });
        }
      } else if (currentShips.length > targetShipCount) {
        // Eğer gemi sayısı fazla ise, fazla gemileri kaldır
        allShips.push(...currentShips.slice(0, targetShipCount));
      } else {
        // Gemi sayısı uygun, mevcut gemileri koru
        allShips.push(...currentShips);
      }
    }
  });
  
  // Saldırı halindeki gemileri de koru
  const attackingShips = existingSpaceships.filter(ship => ship.status === 'attacking');
  allShips.push(...attackingShips);
  
  return allShips;
};

const updateSpaceships = (planets: Planet[], existingSpaceships: Spaceship[] = []): Spaceship[] => {
  return generateSpaceships(planets, existingSpaceships);
};

const updateSpaceshipAngles = (spaceships: Spaceship[]): Spaceship[] => {
  return spaceships.map(ship => {
    if (ship.status === 'orbiting') {
      return {
        ...ship,
        angle: (ship.angle + 1) % 360, // Daha yavaş rotasyon
        orbitAngle: (ship.orbitAngle! + 1) % 360
      };
    } else if (ship.status === 'attacking' && ship.startTime && ship.startX !== undefined) {
      // Saldırı animasyonu devam ediyor
      const elapsed = Date.now() - ship.startTime;
      const duration = 2000;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) {
        // Saldırı tamamlandı, artık bu gemi hedefe ulaştı
        return {
          ...ship,
          status: 'moving' // Geçici durum, executeAttack'ta güncellenecek
        };
      }
    }
    return ship;
  });
};

const createAttackAnimation = (
  fromPlanet: Planet, 
  toPlanet: Planet, 
  attackingShips: number,
  soldiers: number
): AttackAnimation => {
  return {
    id: `attack-${Date.now()}`,
    fromPlanetId: fromPlanet.id,
    toPlanetId: toPlanet.id,
    startTime: Date.now(),
    duration: 2000, // 2 saniye
    attackingShipIds: [], // Bu ID'ler executeAttack'ta doldurulacak
    soldiers
  };
};

// Saldırı için gemileri hazırla
const prepareAttackingShips = (
  spaceships: Spaceship[], 
  fromPlanet: Planet, 
  toPlanet: Planet, 
  shipCount: number
): { updatedSpaceships: Spaceship[], attackingShipIds: string[] } => {
  const planetShips = spaceships.filter(ship => 
    ship.planetId === fromPlanet.id && ship.status === 'orbiting'
  );
  
  const attackingShips = planetShips.slice(0, shipCount);
  const attackingShipIds = attackingShips.map(ship => ship.id);
  
  const updatedSpaceships = spaceships.map(ship => {
    if (attackingShipIds.includes(ship.id)) {
      return {
        ...ship,
        status: 'attacking' as const,
        isAttacking: true,
        targetPlanetId: toPlanet.id,
        startTime: Date.now(),
        startX: fromPlanet.x,
        startY: fromPlanet.y,
        targetX: toPlanet.x,
        targetY: toPlanet.y
      };
    }
    return ship;
  });
  
  return { updatedSpaceships, attackingShipIds };
};

// Saldırı sonrası gemileri güncelle
const updateShipsAfterAttack = (
  spaceships: Spaceship[], 
  attackingShipIds: string[],
  winnerPlanet: Planet,
  newOwner: Player | null
): Spaceship[] => {
  return spaceships.map(ship => {
    if (attackingShipIds.includes(ship.id)) {
      // Saldıran gemiler galip tarafın gezegeninde yörüngede dönmeye başlar
      const newAngle = Math.random() * 360; // Rastgele açıda yerleştir
      
      return {
        ...ship,
        planetId: winnerPlanet.id,
        status: 'orbiting',
        isAttacking: false,
        targetPlanetId: undefined,
        startTime: undefined,
        startX: undefined,
        startY: undefined,
        targetX: undefined,
        targetY: undefined,
        angle: newAngle,
        orbitAngle: newAngle
      };
    }
    return ship;
  });
};

// Oyun sonu kontrolü için yardımcı fonksiyon
const checkGameOver = (planets: Planet[], players: Player[]): { isGameOver: boolean; winner: Player | null } => {
  // Her oyuncunun kaç gezegeni olduğunu say
  const playerPlanetCounts = players.map(player => ({
    player,
    planetCount: planets.filter(p => p.owner?.id === player.id).length
  }));
  
  // Hala gezegeni olan oyuncuları bul
  const remainingPlayers = playerPlanetCounts.filter(p => p.planetCount > 0);
  
  // Eğer sadece bir oyuncu kaldıysa, o kazanır
  if (remainingPlayers.length <= 1) {
    return {
      isGameOver: true,
      winner: remainingPlayers.length === 1 ? remainingPlayers[0].player : null
    };
  }
  
  // Oyun devam ediyor
  return {
    isGameOver: false,
    winner: null
  };
};

// Seviyeye göre özel gezegen türü seçimi
const getRandomSpecialType = (level: number): PlanetSpecialType => {
  // İlk 5 bölümde özel gezegen yok
  if (level <= 5) {
    return PlanetSpecialType.NORMAL;
  }
  
  // 6+ bölümde %30 şans ile özel gezegen
  if (Math.random() > 0.3) {
    return PlanetSpecialType.NORMAL;
  }
  
  // Özel gezegen türlerini seviyeye göre unlockla
  const availableTypes = [PlanetSpecialType.ENERGY]; // 6+ bölümde enerji
  
  if (level >= 8) {
    availableTypes.push(PlanetSpecialType.FORTRESS); // 8+ bölümde kale
  }
  
  if (level >= 12) {
    availableTypes.push(PlanetSpecialType.FACTORY); // 12+ bölümde fabrika
  }
  
  if (level >= 16) {
    availableTypes.push(PlanetSpecialType.RARE); // 16+ bölümde nadir
  }
  
  return availableTypes[Math.floor(Math.random() * availableTypes.length)];
};

// Komşu gezegenler arası mesafe kontrolü (fabrika bonusu için)
const getNeighborPlanets = (planet: Planet, allPlanets: Planet[]): Planet[] => {
  const maxDistance = 120; // Komşu sayılacak maksimum mesafe
  
  return allPlanets.filter(p => {
    if (p.id === planet.id) return false;
    const distance = Math.sqrt(Math.pow(p.x - planet.x, 2) + Math.pow(p.y - planet.y, 2));
    return distance <= maxDistance;
  });
};

export const useGameLogic = (username: string = 'Oyuncu') => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(1, username));
  const { t } = useTranslation();

  // Kullanıcı adı değiştiğinde oyuncu adını güncelle
  useEffect(() => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player => 
        player.id === '1' ? { ...player, name: username } : player
      );
      
      // Gezegenlerdeki owner referanslarını da güncelle
      const updatedPlanets = prev.planets.map(planet => {
        if (planet.owner && planet.owner.id === '1') {
          return {
            ...planet,
            owner: { ...planet.owner, name: username }
          };
        }
        return planet;
      });
      
      return {
        ...prev,
        planets: updatedPlanets,
        players: updatedPlayers,
        username,
        currentPlayer: updatedPlayers.find(p => p.id === prev.currentPlayer.id) || updatedPlayers[0]
      };
    });
  }, [username]);

  // Skor kaydetme fonksiyonu
  const saveGameScore = useCallback((completedLevels: number) => {
    const totalTime = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    
    const score: ScoreEntry = {
      username: gameState.username,
      level: gameState.level,
      completedLevels,
      totalTime,
      date: new Date().toISOString()
    };
    
    saveScore(score);
  }, [gameState.username, gameState.level, gameState.gameStartTime]);

  // Asker üretimi
  const updateProduction = useCallback(() => {
    setGameState(prev => {
      const now = Date.now();
      const updatedPlanets = prev.planets.map(planet => {
        if (planet.owner && now - planet.lastProductionTime >= PRODUCTION_INTERVAL) {
          // Temel üretim hızını hesapla
          let finalProductionRate = planet.productionRate;
          
          // Özel gezegen bonuslarını uygula
          if (planet.specialType) {
            const specialConfig = SPECIAL_PLANET_CONFIGS[planet.specialType];
            finalProductionRate *= specialConfig.productionMultiplier;
            
            // Fabrika gezegeni komşu bonusu
            if (planet.specialType === PlanetSpecialType.FACTORY) {
              const neighbors = getNeighborPlanets(planet, prev.planets);
              const ownedNeighbors = neighbors.filter(n => n.owner?.id === planet.owner?.id);
              finalProductionRate += ownedNeighbors.length * specialConfig.neighborBonus;
            }
          }
          
          // Komşu fabrika bonuslarını kontrol et
          const neighbors = getNeighborPlanets(planet, prev.planets);
          const factoryNeighbors = neighbors.filter(n => 
            n.owner?.id === planet.owner?.id && 
            n.specialType === PlanetSpecialType.FACTORY
          );
          finalProductionRate += factoryNeighbors.length * SPECIAL_PLANET_CONFIGS[PlanetSpecialType.FACTORY].neighborBonus;
          
          const newSoldierCount = Math.min(
            planet.soldierCount + Math.floor(finalProductionRate),
            planet.maxSoldiers
          );
          
          return {
            ...planet,
            soldierCount: newSoldierCount,
            lastProductionTime: now
          };
        }
        return planet;
      });

      // Uzay gemilerini güncelle
      const updatedSpaceships = updateSpaceships(updatedPlanets, prev.spaceships);

      return { 
        ...prev, 
        planets: updatedPlanets,
        spaceships: updatedSpaceships
      };
    });
  }, []);

  // Gezegen seçimi - basitleştirilmiş mantık
  const selectPlanet = useCallback((planet: Planet) => {
    setGameState(prev => {
      // Kendi gezegenini seç
      if (planet.owner?.id === prev.currentPlayer.id) {
        if (prev.gamePhase === GamePhase.SELECTION) {
          return {
            ...prev,
            selectedPlanets: [planet],
            gamePhase: GamePhase.MULTI_SELECTION
          };
        } else if (prev.gamePhase === GamePhase.MULTI_SELECTION) {
          // Aynı gezegeni tekrar seçerse çıkar
          const isAlreadySelected = prev.selectedPlanets?.some(p => p.id === planet.id);
          if (isAlreadySelected) {
            const updatedSelection = prev.selectedPlanets?.filter(p => p.id !== planet.id) || [];
            return {
              ...prev,
              selectedPlanets: updatedSelection,
              gamePhase: updatedSelection.length === 0 ? GamePhase.SELECTION : GamePhase.MULTI_SELECTION
            };
          } else {
            // Yeni gezegen ekle
            return {
              ...prev,
              selectedPlanets: [...(prev.selectedPlanets || []), planet]
            };
          }
        }
      }
      
      // Düşman veya tarafsız gezegene tıklarsa hedef olarak seç
      if (planet.owner?.id !== prev.currentPlayer.id && prev.selectedPlanets?.length > 0) {
        return {
          ...prev,
          targetPlanet: planet,
          gamePhase: GamePhase.ATTACK
        };
      }
      
      return prev;
    });
  }, []);

  // Saldırı hedefi seçimi - artık gerekli değil, selectPlanet içinde hallediliyor
  const selectTarget = useCallback((planet: Planet) => {
    // Bu fonksiyon artık kullanılmıyor, selectPlanet içinde hallediliyor
  }, []);

  // Saldırı gerçekleştirme - çoklu gezegen saldırısı
  const executeAttack = useCallback((percentage: AttackPercentage) => {
    setGameState(prev => {
      if (!prev.selectedPlanets || prev.selectedPlanets.length === 0 || prev.targetPlanet === null) return prev;

      const attackingPlanets = prev.selectedPlanets;
      const defendingPlanet = prev.targetPlanet;
      
      // Toplam saldırı gücü
      const totalAttackingSoldiers = attackingPlanets.reduce((total, planet) => total + planet.soldierCount, 0);
      const attackingSoldiers = Math.floor(totalAttackingSoldiers * (percentage / 100));
      
      if (attackingSoldiers <= 0) return prev;

      // Saldırı gemilerini hazırla
      const attackingShipCount = Math.min(Math.floor(attackingSoldiers / 5), 10);
      const { updatedSpaceships, attackingShipIds } = prepareAttackingShips(
        prev.spaceships,
        attackingPlanets[0],
        defendingPlanet,
        attackingShipCount
      );

      // Saldırı animasyonu oluştur
      const attackAnimation = createAttackAnimation(
        attackingPlanets[0], 
        defendingPlanet, 
        attackingShipCount,
        attackingSoldiers
      );

      // Animasyon başladığında attackingShipIds'yi güncelle
      attackAnimation.attackingShipIds = attackingShipIds;

      // Saldırı sonucu hesapla
      let defendingSoldiers = defendingPlanet.owner?.id === attackingPlanets[0].owner?.id ? 0 : defendingPlanet.soldierCount;
      
      // Kale gezegeni savunma bonusu uygula
      if (defendingPlanet.specialType === PlanetSpecialType.FORTRESS && defendingPlanet.owner) {
        const defenseBonus = SPECIAL_PLANET_CONFIGS[PlanetSpecialType.FORTRESS].defenseBonus;
        defendingSoldiers = Math.floor(defendingSoldiers * (1 + defenseBonus));
      }
      
      const remainingAttackers = Math.max(0, attackingSoldiers - defendingSoldiers);
      
      // Gezegenler durumunu güncelle
      const updatedPlanets = prev.planets.map(planet => {
        const attackingPlanet = attackingPlanets.find(p => p.id === planet.id);
        if (attackingPlanet) {
          const soldiersToSend = Math.floor(attackingPlanet.soldierCount * (percentage / 100));
          return {
            ...planet,
            soldierCount: planet.soldierCount - soldiersToSend
          };
        }
        if (planet.id === defendingPlanet.id) {
          const newOwner = remainingAttackers > 0 ? attackingPlanets[0].owner : defendingPlanet.owner;
          return {
            ...planet,
            owner: newOwner,
            soldierCount: remainingAttackers
          };
        }
        return planet;
      });

      // Oyun sonu kontrolü
      const gameResult = checkGameOver(updatedPlanets, prev.players);
      
      // Sıra değişimi
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayer.id);
      const nextPlayerIndex = (currentPlayerIndex + 1) % prev.players.length;
      const nextPlayer = prev.players[nextPlayerIndex];
      
      // Saldırı tamamlandıktan sonra gemileri güncelle (2 saniye sonra)
      setTimeout(() => {
        setGameState(prevState => {
          const finalPlanet = prevState.planets.find(p => p.id === defendingPlanet.id)!;
          const finalSpaceships = updateShipsAfterAttack(
            prevState.spaceships,
            attackingShipIds,
            finalPlanet,
            remainingAttackers > 0 ? attackingPlanets[0].owner : defendingPlanet.owner
          );
          
          const finalUpdatedSpaceships = updateSpaceships(prevState.planets, finalSpaceships);
          
          return {
            ...prevState,
            spaceships: finalUpdatedSpaceships
          };
        });
      }, 2500);
      
      return {
        ...prev,
        planets: updatedPlanets,
        selectedPlanets: [],
        targetPlanet: null,
        gamePhase: GamePhase.SELECTION,
        currentPlayer: nextPlayer,
        isGameOver: gameResult.isGameOver,
        winner: gameResult.winner,
        levelCompleted: gameResult.isGameOver && gameResult.winner?.id === '1',
        spaceships: updatedSpaceships,
        attackAnimations: [...prev.attackAnimations, attackAnimation]
      };
    });
  }, []);

  // AI hamlesi
  const makeAITurn = useCallback(() => {
    setGameState(prev => {
      if (prev.currentPlayer.isAI && !prev.isGameOver) {
        const aiMove = makeAIMove(prev);
        
        if (aiMove) {
          const attackingSoldiers = Math.floor(aiMove.fromPlanets[0].soldierCount * (aiMove.percentage / 100));
          let defendingSoldiers = aiMove.toPlanet.owner?.id === aiMove.fromPlanets[0].owner?.id ? 0 : aiMove.toPlanet.soldierCount;
          
          // Kale gezegeni savunma bonusu uygula (AI için de)
          if (aiMove.toPlanet.specialType === PlanetSpecialType.FORTRESS && aiMove.toPlanet.owner) {
            const defenseBonus = SPECIAL_PLANET_CONFIGS[PlanetSpecialType.FORTRESS].defenseBonus;
            defendingSoldiers = Math.floor(defendingSoldiers * (1 + defenseBonus));
          }
          
          const remainingAttackers = Math.max(0, attackingSoldiers - defendingSoldiers);
          
          // AI saldırı gemilerini hazırla
          const aiAttackingShipCount = Math.min(Math.floor(attackingSoldiers / 5), 10);
          const { updatedSpaceships: aiUpdatedSpaceships, attackingShipIds: aiAttackingShipIds } = prepareAttackingShips(
            prev.spaceships,
            aiMove.fromPlanets[0],
            aiMove.toPlanet,
            aiAttackingShipCount
          );
          
          // AI saldırı animasyonu oluştur
          const aiAttackAnimation = createAttackAnimation(
            aiMove.fromPlanets[0], 
            aiMove.toPlanet, 
            aiAttackingShipCount,
            attackingSoldiers
          );
          
          // AI animasyon IDs'lerini güncelle
          aiAttackAnimation.attackingShipIds = aiAttackingShipIds;
          
          const updatedPlanets = prev.planets.map(planet => {
            if (planet.id === aiMove.fromPlanets[0].id) {
              return {
                ...planet,
                soldierCount: planet.soldierCount - attackingSoldiers
              };
            }
            if (planet.id === aiMove.toPlanet.id) {
              const newOwner = remainingAttackers > 0 ? aiMove.fromPlanets[0].owner : aiMove.toPlanet.owner;
              return {
                ...planet,
                owner: newOwner,
                soldierCount: remainingAttackers
              };
            }
            return planet;
          });

          // Oyun sonu kontrolü
          const gameResult = checkGameOver(updatedPlanets, prev.players);
          
          // Sıra değişimi
          const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayer.id);
          const nextPlayerIndex = (currentPlayerIndex + 1) % prev.players.length;
          const nextPlayer = prev.players[nextPlayerIndex];
          
          // AI saldırı tamamlandıktan sonra gemileri güncelle
          setTimeout(() => {
            setGameState(prevState => {
              const finalPlanetAI = prevState.planets.find(p => p.id === aiMove.toPlanet.id)!;
              const finalSpaceshipsAI = updateShipsAfterAttack(
                prevState.spaceships,
                aiAttackingShipIds,
                finalPlanetAI,
                remainingAttackers > 0 ? aiMove.fromPlanets[0].owner : aiMove.toPlanet.owner
              );
              
              const finalUpdatedSpaceshipsAI = updateSpaceships(prevState.planets, finalSpaceshipsAI);
              
              return {
                ...prevState,
                spaceships: finalUpdatedSpaceshipsAI
              };
            });
          }, 2500);
          
          return {
            ...prev,
            planets: updatedPlanets,
            currentPlayer: nextPlayer,
            isGameOver: gameResult.isGameOver,
            winner: gameResult.winner,
            levelCompleted: gameResult.isGameOver && gameResult.winner?.id === '1',
            spaceships: aiUpdatedSpaceships,
            attackAnimations: [...prev.attackAnimations, aiAttackAnimation]
          };
        } else {
          // AI hamle bulamadıysa sırayı diğer oyuncuya ver
          const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayer.id);
          const nextPlayerIndex = (currentPlayerIndex + 1) % prev.players.length;
          const nextPlayer = prev.players[nextPlayerIndex];
          
          return {
            ...prev,
            currentPlayer: nextPlayer
          };
        }
      }
      return prev;
    });
  }, []);

  // Seçimi temizleme
  const clearSelection = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedPlanets: [],
      targetPlanet: null,
      gamePhase: GamePhase.SELECTION
    }));
  }, []);

  // Sonraki bölüme geç
  const nextLevel = useCallback(() => {
    const nextLevelNumber = gameState.level + 1;
    const maxLevel = LEVEL_CONFIGS.length; // 20 bölüm
    
    if (nextLevelNumber <= maxLevel) {
      setGameState(initializeGame(nextLevelNumber, username));
    } else {
      // Oyun tamamlandı, skoru kaydet - 20 bölümü bitirdi!
      saveGameScore(20);
      alert(t('congratulations', { username }));
    }
  }, [gameState.level, username, saveGameScore, t]);

  // Oyunu yeniden başlat
  const restartGame = useCallback(() => {
    setGameState(initializeGame(1, username));
  }, [username]);

  // Game loop
  useEffect(() => {
    const productionTimer = setInterval(updateProduction, PRODUCTION_INTERVAL);
    const gameTimer = setInterval(() => {
      setGameState(prev => ({ ...prev, gameTime: prev.gameTime + GAME_TICK_INTERVAL }));
    }, GAME_TICK_INTERVAL);
    
    // Animasyon temizleme timer'ı
    const animationCleanupTimer = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        const activeAnimations = prev.attackAnimations.filter(animation => 
          now - animation.startTime < animation.duration + 1000 // 1 saniye ek süre
        );
        
        return {
          ...prev,
          attackAnimations: activeAnimations
        };
      });
    }, 1000);
    
    // Uzay gemisi açı güncelleme timer'ı
    const spaceshipUpdateTimer = setInterval(() => {
      setGameState(prev => {
        const updatedSpaceships = updateSpaceshipAngles(prev.spaceships);
        return {
          ...prev,
          spaceships: updatedSpaceships
        };
      });
    }, 50); // 20 FPS

    return () => {
      clearInterval(productionTimer);
      clearInterval(gameTimer);
      clearInterval(animationCleanupTimer);
      clearInterval(spaceshipUpdateTimer);
    };
  }, [updateProduction]);

  // AI hamle zamanlayıcısı
  useEffect(() => {
    if (gameState.currentPlayer.isAI && !gameState.isGameOver) {
      const levelConfig = LEVEL_CONFIGS.find(l => l.level === gameState.level) || LEVEL_CONFIGS[0];
      const aiTimer = setTimeout(makeAITurn, levelConfig.aiThinkingTime);
      return () => clearTimeout(aiTimer);
    }
  }, [gameState.currentPlayer, gameState.isGameOver, gameState.level, makeAITurn]);

  // Bölüm tamamlandığında skoru kaydet
  useEffect(() => {
    if (gameState.levelCompleted && gameState.winner?.id === '1') {
      saveGameScore(gameState.level);
    }
  }, [gameState.levelCompleted, gameState.winner, gameState.level, saveGameScore]);

  return {
    gameState,
    selectPlanet,
    selectTarget,
    executeAttack,
    clearSelection,
    restartGame,
    nextLevel
  };
}; 