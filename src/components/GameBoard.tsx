import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Planet as PlanetType, GameState, GamePhase } from '../types/game';
import { Planet } from './Planet';
import { AttackButtons } from './AttackButtons';
import { AttackPercentage } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  onPlanetClick: (planet: PlanetType) => void;
  onAttack: (percentage: AttackPercentage) => void;
  onNextLevel: () => void;
  onClearSelection?: () => void;
}

interface AttackAnimation {
  fromPlanetId: string;
  toPlanetId: string;
  startTime: number;
  ships: {
    id: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    angle: number;
  }[];
}

const MainContainer = styled.div`
  display: flex;
  width: 1200px;
  height: 700px;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 2px solid #333;
  overflow: hidden;
`;

const GameContainer = styled.div`
  width: 800px;
  height: 600px;
  background: transparent;
  position: relative;
  margin: 50px 20px;
`;

const SidePanel = styled.div`
  width: 350px;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  border-left: 2px solid #333;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: white;
  font-family: 'Arial', sans-serif;
`;

const LevelSection = styled.div`
  text-align: center;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #FFD700;
`;

const LevelTitle = styled.div`
  color: #FFD700;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const PlayersSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #87CEEB;
  font-size: 16px;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
`;

const GameStatusSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  flex: 1;
`;

const SpecialPlanetsSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
`;

const SpecialPlanetItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 12px;
`;

const SpecialIcon = styled.span`
  font-size: 14px;
  width: 20px;
  text-align: center;
`;

const StatusItem = styled.div`
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
`;

const CurrentTurnIndicator = styled.div<{ color: string }>`
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  border-left: 4px solid ${props => props.color};
  font-weight: bold;
  animation: pulse 1s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 40;
  pointer-events: none;
`;

const AttackPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  padding: 8px 12px;
  border-bottom: 2px solid #444;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
`;

const SelectionInfo = styled.div`
  color: white;
  font-family: 'Arial', sans-serif;
  font-size: 11px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CloseButton = styled.button`
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #b71c1c;
  }
`;

const GameOverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const GameOverText = styled.h1`
  color: #FFD700;
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const WinnerText = styled.div`
  color: white;
  font-size: 24px;
  margin-bottom: 30px;
`;

const LevelCompleteOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const LevelCompleteText = styled.h1`
  color: #4CAF50;
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const LevelInfoText = styled.div`
  color: white;
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const ActionButton = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const NextLevelButton = styled(ActionButton)`
  background: #4CAF50;
  color: white;
  
  &:hover {
    background: #45a049;
  }
`;

const RestartButton = styled(ActionButton)`
  background: #FF9800;
  color: white;
  
  &:hover {
    background: #F57C00;
  }
`;

const Stars = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #ddd, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 4s infinite;
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`;

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onPlanetClick,
  onAttack,
  onNextLevel,
  onClearSelection
}) => {
  const [attackAnimations, setAttackAnimations] = useState<AttackAnimation[]>([]);
  const { t } = useTranslation();

  // Saldırı animasyonunu başlat
  const startAttackAnimation = (fromPlanetId: string, toPlanetId: string) => {
    const animation: AttackAnimation = {
      fromPlanetId,
      toPlanetId,
      startTime: Date.now(),
      ships: []
    };
    
    setAttackAnimations(prev => [...prev, animation]);
    
    // 1.5 saniye sonra animasyonu temizle
    setTimeout(() => {
      setAttackAnimations(prev => prev.filter(a => a !== animation));
    }, 1500);
  };

  // Saldırı gerçekleştiğinde animasyonu tetikle
  useEffect(() => {
    if (gameState.selectedPlanets && gameState.targetPlanet) {
      const fromPlanetId = gameState.selectedPlanets[0]?.id;
      const toPlanetId = gameState.targetPlanet.id;
      
      if (fromPlanetId && toPlanetId) {
        startAttackAnimation(fromPlanetId, toPlanetId);
      }
    }
  }, [gameState.selectedPlanets, gameState.targetPlanet]);

  const getPlayerPlanetCount = (playerId: string) => {
    return gameState.planets.filter(p => p.owner?.id === playerId).length;
  };

  const getPhaseText = () => {
    switch (gameState.gamePhase) {
      case GamePhase.SELECTION:
        return t('game.phases.selectPlanet');
      case GamePhase.MULTI_SELECTION:
        return t('game.phases.multiSelection');
      case GamePhase.ATTACK:
        return t('game.phases.selectTarget');
      case GamePhase.GAME_OVER:
        return t('game.phases.gameOver');
      case GamePhase.LEVEL_COMPLETE:
        return t('game.phases.levelComplete');
      default:
        return '';
    }
  };

  const handlePlanetClick = (planet: PlanetType) => {
    if (gameState.gamePhase === GamePhase.SELECTION || gameState.gamePhase === GamePhase.MULTI_SELECTION) {
      onPlanetClick(planet);
    } else if (gameState.gamePhase === GamePhase.ATTACK) {
      onPlanetClick(planet);
    }
  };

  // Gezegen için saldırı durumunu kontrol et
  const getPlanetAttackState = (planet: PlanetType) => {
    const activeAnimation = attackAnimations.find(a => 
      a.fromPlanetId === planet.id || a.toPlanetId === planet.id
    );
    
    if (!activeAnimation) return { isAttacking: false, attackTarget: null };
    
    if (activeAnimation.fromPlanetId === planet.id) {
      // Saldıran gezegen
      const targetPlanet = gameState.planets.find(p => p.id === activeAnimation.toPlanetId);
      if (targetPlanet) {
        return {
          isAttacking: true,
          attackTarget: { x: targetPlanet.x, y: targetPlanet.y }
        };
      }
    }
    
    return { isAttacking: false, attackTarget: null };
  };

  // Bölüm tamamlama ekranı
  if (gameState.levelCompleted && gameState.winner?.id === '1') {
    return (
      <GameContainer>
        <Stars />
        <LevelCompleteOverlay>
          <LevelCompleteText>{t('game.levelComplete.title', { level: gameState.level })}</LevelCompleteText>
          <LevelInfoText style={{ whiteSpace: 'pre-line' }}>
            {t('game.levelComplete.congratulations', { level: gameState.level })}
          </LevelInfoText>
          <ButtonContainer>
            <NextLevelButton onClick={onNextLevel}>
              {t('game.levelComplete.nextLevel')}
            </NextLevelButton>
            <RestartButton onClick={() => window.location.reload()}>
              {t('game.levelComplete.restart')}
            </RestartButton>
          </ButtonContainer>
        </LevelCompleteOverlay>
      </GameContainer>
    );
  }

  // Oyun sonu ekranı (AI kazandı)
  if (gameState.isGameOver && gameState.winner?.id === '2') {
    return (
      <GameContainer>
        <Stars />
        <GameOverOverlay>
          <GameOverText>{t('game.gameOver.title')}</GameOverText>
          <WinnerText>
            {t('game.gameOver.aiWon', { level: gameState.level })}
          </WinnerText>
          <RestartButton onClick={() => window.location.reload()}>
            {t('game.gameOver.restart')}
          </RestartButton>
        </GameOverOverlay>
      </GameContainer>
    );
  }

  return (
    <MainContainer>
      <GameContainer>
        <Stars />
        
        {gameState.planets.map(planet => {
          const attackState = getPlanetAttackState(planet);
          return (
            <Planet
              key={planet.id}
              planet={planet}
              isSelected={gameState.selectedPlanets?.some(p => p.id === planet.id) || false}
              isTarget={gameState.targetPlanet?.id === planet.id}
              onClick={handlePlanetClick}
              isAttacking={attackState.isAttacking}
              attackTarget={attackState.attackTarget}
              spaceships={gameState.spaceships}
            />
          );
        })}

        {/* Global saldırı gemileri - gezegenler arası hareket */}
        {gameState.spaceships
          .filter(ship => ship.status === 'attacking')
          .map(ship => {
            if (!ship.startTime || !ship.startX || !ship.startY || !ship.targetX || !ship.targetY) {
              return null;
            }
            
            const elapsed = Date.now() - ship.startTime;
            const duration = 2000;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = ship.startX + (ship.targetX - ship.startX) * progress;
            const currentY = ship.startY + (ship.targetY - ship.startY) * progress;
            
            const angle = Math.atan2(ship.targetY - ship.startY, ship.targetX - ship.startX) * 180 / Math.PI;
            
            return (
              <div
                key={ship.id}
                style={{
                  position: 'absolute',
                  left: currentX,
                  top: currentY,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  pointerEvents: 'none',
                  zIndex: 30
                }}
              >
                <svg width={12} height={12} viewBox="0 0 12 12">
                  <polygon points="6,1 11,11 1,11" fill="#FFD700" stroke="#fff" strokeWidth="0.7" />
                </svg>
              </div>
            );
          })}

        {(gameState.gamePhase === GamePhase.ATTACK || gameState.gamePhase === GamePhase.MULTI_SELECTION) &&
         gameState.selectedPlanets?.length > 0 && 
         !gameState.currentPlayer.isAI && (
          <>
            <Overlay />
            <AttackPanel>
              <SelectionInfo>
                <InfoItem>
                  <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {gameState.gamePhase === GamePhase.MULTI_SELECTION ? t('game.attackPanel.selectTarget') : t('game.attackPanel.ready')}
                  </span>
                </InfoItem>
                <InfoItem>
                  <span>{t('game.attackPanel.selected', { count: gameState.selectedPlanets?.length })}</span>
                </InfoItem>
                {gameState.selectedPlanets && gameState.selectedPlanets.length > 0 && (
                  <InfoItem>
                    <span style={{ color: '#4CAF50' }}>
                      {t('game.attackPanel.soldiers', { 
                        count: gameState.selectedPlanets.reduce((total, p) => {
                          const currentPlanet = gameState.planets.find(planet => planet.id === p.id);
                          return total + (currentPlanet?.soldierCount || 0);
                        }, 0)
                      })}
                    </span>
                  </InfoItem>
                )}
                {gameState.targetPlanet && (
                  <InfoItem>
                    <span style={{ color: '#FF6B6B' }}>
                      {t('game.attackPanel.target', { 
                        owner: gameState.targetPlanet.owner?.name || t('game.attackPanel.neutral'),
                        soldiers: gameState.targetPlanet.soldierCount 
                      })}
                    </span>
                  </InfoItem>
                )}
              </SelectionInfo>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AttackButtons
                  onAttack={onAttack}
                  disabled={!gameState.targetPlanet}
                />
                <CloseButton onClick={onClearSelection} title={t('game.attackPanel.cancel')}>
                  {t('game.attackPanel.cancel')}
                </CloseButton>
              </div>
            </AttackPanel>
          </>
        )}
      </GameContainer>
      <SidePanel>
        <LevelSection>
          <LevelTitle>{t('game.level')} {gameState.level}</LevelTitle>
        </LevelSection>
        <PlayersSection>
          <SectionTitle>{t('game.players')}</SectionTitle>
          {gameState.players.map(player => (
            <StatusItem key={player.id}>
              <span>{player.name}: {t('game.planetInfo', { count: getPlayerPlanetCount(player.id) })}</span>
            </StatusItem>
          ))}
        </PlayersSection>
        <GameStatusSection>
          <SectionTitle>{t('game.gameStatus')}</SectionTitle>
          <StatusItem>
            <span>{getPhaseText()}</span>
          </StatusItem>
          <StatusItem>
            <CurrentTurnIndicator color={gameState.currentPlayer.color}>
              {t('game.currentTurn', { playerName: gameState.currentPlayer.name })}
            </CurrentTurnIndicator>
          </StatusItem>
          {gameState.currentPlayer.isAI && (
            <StatusItem>
              <span>{t('game.thinking', { playerName: gameState.currentPlayer.name })}</span>
            </StatusItem>
          )}
        </GameStatusSection>
        <SpecialPlanetsSection>
          <SectionTitle>{t('game.specialPlanets')}</SectionTitle>
          {gameState.level >= 6 && (
            <>
              <SpecialPlanetItem>
                <SpecialIcon>⚡</SpecialIcon>
                <span>{t('game.specialTypes.energy')}</span>
              </SpecialPlanetItem>
              {gameState.level >= 8 && (
                <SpecialPlanetItem>
                  <SpecialIcon>🛡️</SpecialIcon>
                  <span>{t('game.specialTypes.fortress')}</span>
                </SpecialPlanetItem>
              )}
              {gameState.level >= 12 && (
                <SpecialPlanetItem>
                  <SpecialIcon>🏭</SpecialIcon>
                  <span>{t('game.specialTypes.factory')}</span>
                </SpecialPlanetItem>
              )}
              {gameState.level >= 16 && (
                <SpecialPlanetItem>
                  <SpecialIcon>💎</SpecialIcon>
                  <span>{t('game.specialTypes.rare')}</span>
                </SpecialPlanetItem>
              )}
            </>
          )}
          {gameState.level < 6 && (
            <SpecialPlanetItem>
              <span style={{ fontStyle: 'italic', color: '#888' }}>
                {t('game.specialTypes.unlockNote')}
              </span>
            </SpecialPlanetItem>
          )}
        </SpecialPlanetsSection>
      </SidePanel>
    </MainContainer>
  );
}; 