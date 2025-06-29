import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Planet as PlanetType, PlanetSize, PlanetSpecialType, Spaceship } from '../types/game';

interface PlanetProps {
  planet: PlanetType;
  isSelected: boolean;
  isTarget: boolean;
  onClick: (planet: PlanetType) => void;
  isAttacking?: boolean;
  attackTarget?: { x: number; y: number } | null;
  spaceships?: Spaceship[];
}

const PLANET_CONFIGS = {
  [PlanetSize.TINY]: {
    radius: 15,
    fontSize: 10,
    atmosphereSize: 6,
    orbitRadius: 28
  },
  [PlanetSize.SMALL]: {
    radius: 20,
    fontSize: 12,
    atmosphereSize: 8,
    orbitRadius: 35
  },
  [PlanetSize.MEDIUM]: {
    radius: 30,
    fontSize: 14,
    atmosphereSize: 12,
    orbitRadius: 50
  },
  [PlanetSize.LARGE]: {
    radius: 40,
    fontSize: 16,
    atmosphereSize: 16,
    orbitRadius: 65
  },
  [PlanetSize.HUGE]: {
    radius: 50,
    fontSize: 18,
    atmosphereSize: 20,
    orbitRadius: 80
  }
};

// Gezegen renk paletleri
const PLANET_COLORS = {
  neutral: {
    primary: '#8B7355',
    secondary: '#A0522D',
    accent: '#CD853F'
  },
  player: {
    primary: '#2E8B57',
    secondary: '#3CB371',
    accent: '#90EE90'
  },
  ai1: {
    primary: '#DC143C',
    secondary: '#FF6347',
    accent: '#FFB6C1'
  },
  ai2: {
    primary: '#8A2BE2',
    secondary: '#9370DB',
    accent: '#DDA0DD'
  },
  ai3: {
    primary: '#4169E1',
    secondary: '#6495ED',
    accent: '#87CEEB'
  },
  ai4: {
    primary: '#FF8C00',
    secondary: '#FFA500',
    accent: '#FFD700'
  },
  ai5: {
    primary: '#8B4513',
    secondary: '#A0522D',
    accent: '#DEB887'
  }
};

const getPlanetColors = (ownerColor: string) => {
  if (!ownerColor) return PLANET_COLORS.neutral;
  
  switch (ownerColor) {
    case '#4CAF50': return PLANET_COLORS.player;
    case '#F44336': return PLANET_COLORS.ai1;
    case '#9C27B0': return PLANET_COLORS.ai2;
    case '#3F51B5': return PLANET_COLORS.ai3;
    case '#FF9800': return PLANET_COLORS.ai4;
    case '#795548': return PLANET_COLORS.ai5;
    default: return PLANET_COLORS.neutral;
  }
};

// Animasyonlar
const atmosphere = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const energyPulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
`;

const fortressShield = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
`;

const factoryGlow = keyframes`
  0%, 100% { box-shadow: 0 0 10px #FFA500; }
  50% { box-shadow: 0 0 20px #FFA500, 0 0 30px #FF8C00; }
`;

const rareCrystal = keyframes`
  0%, 100% { opacity: 0.7; transform: rotate(0deg); }
  50% { opacity: 1; transform: rotate(180deg); }
`;

const PlanetContainer = styled.div<{
  x: number;
  y: number;
  size: PlanetSize;
  ownerColor: string;
  isSelected: boolean;
  isTarget: boolean;
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => PLANET_CONFIGS[props.size].radius * 2}px;
  height: ${props => PLANET_CONFIGS[props.size].radius * 2}px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.15);
    filter: brightness(1.2);
  }
`;

const PlanetCore = styled.div<{ 
  size: PlanetSize; 
  ownerColor: string;
  isSelected: boolean;
  isTarget: boolean;
}>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: ${props => {
    const colors = getPlanetColors(props.ownerColor);
    return `radial-gradient(circle at 30% 30%, 
      ${colors.accent} 0%, 
      ${colors.secondary} 40%, 
      ${colors.primary} 70%, 
      ${colors.primary} 100%)`;
  }};
  border: ${props => {
    if (props.isSelected) return '3px solid #FFD700';
    if (props.isTarget) return '3px solid #FF6B6B';
    return '2px solid rgba(255, 255, 255, 0.3)';
  }};
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 0, 0, 0.5),
    ${props => props.isSelected ? '0 0 20px #FFD700' : 'none'},
    ${props => props.isTarget ? '0 0 20px #FF6B6B' : 'none'};
  
  &::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 20%;
    width: 20%;
    height: 20%;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    filter: blur(2px);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 60%;
    left: 70%;
    width: 15%;
    height: 15%;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    filter: blur(1px);
  }
`;

const Atmosphere = styled.div<{ size: PlanetSize; ownerColor: string }>`
  position: absolute;
  top: -${props => PLANET_CONFIGS[props.size].atmosphereSize}px;
  left: -${props => PLANET_CONFIGS[props.size].atmosphereSize}px;
  width: ${props => PLANET_CONFIGS[props.size].radius * 2 + PLANET_CONFIGS[props.size].atmosphereSize * 2}px;
  height: ${props => PLANET_CONFIGS[props.size].radius * 2 + PLANET_CONFIGS[props.size].atmosphereSize * 2}px;
  border-radius: 50%;
  background: ${props => {
    const colors = getPlanetColors(props.ownerColor);
    return `radial-gradient(circle, 
      rgba(${colors.primary}, 0.3) 0%, 
      rgba(${colors.secondary}, 0.2) 50%, 
      transparent 100%)`;
  }};
  animation: ${atmosphere} 3s ease-in-out infinite;
`;

const PlanetRing = styled.div<{ size: PlanetSize; ownerColor: string }>`
  position: absolute;
  top: -${props => PLANET_CONFIGS[props.size].orbitRadius - PLANET_CONFIGS[props.size].radius}px;
  left: -${props => PLANET_CONFIGS[props.size].orbitRadius - PLANET_CONFIGS[props.size].radius}px;
  width: ${props => PLANET_CONFIGS[props.size].orbitRadius * 2}px;
  height: ${props => PLANET_CONFIGS[props.size].orbitRadius * 2}px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
`;

const SoldierCount = styled.div<{ size: PlanetSize }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: ${props => PLANET_CONFIGS[props.size].fontSize + 2}px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  z-index: 5;
`;

const PlanetName = styled.div<{ size: PlanetSize; ownerColor: string }>`
  position: absolute;
  bottom: ${props => PLANET_CONFIGS[props.size].radius + 10}px;
  left: 50%;
  transform: translateX(-50%);
  color: ${props => props.ownerColor || '#ccc'};
  font-size: ${props => PLANET_CONFIGS[props.size].fontSize - 2}px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  text-align: center;
`;

// Özel gezegen türü göstergeleri
const SpecialTypeIndicator = styled.div<{ specialType: PlanetSpecialType; size: PlanetSize }>`
  position: absolute;
  top: -5px;
  right: -5px;
  width: ${props => PLANET_CONFIGS[props.size].radius * 0.4}px;
  height: ${props => PLANET_CONFIGS[props.size].radius * 0.4}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => PLANET_CONFIGS[props.size].radius * 0.25}px;
  font-weight: bold;
  z-index: 2;
  
  ${props => {
    switch (props.specialType) {
      case PlanetSpecialType.ENERGY:
        return `
          background: linear-gradient(45deg, #FFD700, #FFA500);
          color: #000;
          animation: ${energyPulse} 1.5s ease-in-out infinite;
          box-shadow: 0 0 10px #FFD700;
        `;
      case PlanetSpecialType.FORTRESS:
        return `
          background: linear-gradient(45deg, #C0C0C0, #808080);
          color: #000;
          animation: ${fortressShield} 2s ease-in-out infinite;
          box-shadow: 0 0 8px #C0C0C0;
        `;
      case PlanetSpecialType.FACTORY:
        return `
          background: linear-gradient(45deg, #FFA500, #FF8C00);
          color: #000;
          animation: ${factoryGlow} 2.5s ease-in-out infinite;
        `;
      case PlanetSpecialType.RARE:
        return `
          background: linear-gradient(45deg, #DA70D6, #9370DB);
          color: #FFF;
          animation: ${rareCrystal} 3s ease-in-out infinite;
          box-shadow: 0 0 12px #DA70D6;
        `;
      default:
        return 'display: none;';
    }
  }}
`;

const getSpecialTypeIcon = (specialType?: PlanetSpecialType): string => {
  switch (specialType) {
    case PlanetSpecialType.ENERGY: return '⚡';
    case PlanetSpecialType.FORTRESS: return '🛡️';
    case PlanetSpecialType.FACTORY: return '🏭';
    case PlanetSpecialType.RARE: return '💎';
    default: return '';
  }
};

export const Planet: React.FC<PlanetProps> = ({
  planet,
  isSelected,
  isTarget,
  onClick,
  isAttacking = false,
  attackTarget = null,
  spaceships = []
}) => {
  const config = PLANET_CONFIGS[planet.size];
  
  // Bu gezegende yörüngede dönen gemiler
  const orbitingShips = spaceships.filter(ship => 
    ship.planetId === planet.id && ship.status === 'orbiting'
  );

  // Gezegen adını belirle
  const getPlanetName = () => {
    if (planet.owner) {
      return planet.owner.name;
    }
    return `Gezegen ${planet.id.split('-')[2]}`;
  };

  return (
    <PlanetContainer
      x={planet.x - config.radius}
      y={planet.y - config.radius}
      size={planet.size}
      ownerColor={planet.owner?.color || ''}
      isSelected={isSelected}
      isTarget={isTarget}
      onClick={() => onClick(planet)}
    >
      <Atmosphere size={planet.size} ownerColor={planet.owner?.color || ''} />
      <PlanetCore
        size={planet.size}
        ownerColor={planet.owner?.color || ''}
        isSelected={isSelected}
        isTarget={isTarget}
      />
      <PlanetRing size={planet.size} ownerColor={planet.owner?.color || ''} />
      
      {/* Özel gezegen türü göstergesi */}
      {planet.specialType && planet.specialType !== PlanetSpecialType.NORMAL && (
        <SpecialTypeIndicator specialType={planet.specialType} size={planet.size}>
          {getSpecialTypeIcon(planet.specialType)}
        </SpecialTypeIndicator>
      )}
      
      {/* Yörüngede dönen gemiler */}
      {planet.owner && orbitingShips.map((ship, i) => (
        <div
          key={ship.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `rotate(${ship.orbitAngle || ship.angle}deg) translateX(${config.orbitRadius}px) rotate(-${ship.orbitAngle || ship.angle}deg)`,
            pointerEvents: 'none',
            zIndex: 10,
            transition: 'none'
          }}
        >
          <svg width={12} height={12} viewBox="0 0 12 12">
            <polygon points="6,1 11,11 1,11" fill={planet.owner!.color} stroke="#fff" strokeWidth="0.7" />
          </svg>
        </div>
      ))}
      
      <SoldierCount size={planet.size}>
        {planet.soldierCount}
      </SoldierCount>
      <PlanetName size={planet.size} ownerColor={planet.owner?.color || ''}>
        {getPlanetName()}
      </PlanetName>
    </PlanetContainer>
  );
}; 