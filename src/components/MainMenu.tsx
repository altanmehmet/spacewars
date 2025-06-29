import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

interface MainMenuProps {
  onStartGame: (username: string) => void;
  onShowScoreboard: () => void;
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 20px #FFD700;
  }
  50% { 
    text-shadow: 0 0 30px #FFD700;
  }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const MenuContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Stars = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 100px 50px, #fff, transparent),
    radial-gradient(1px 1px at 200px 150px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 350px 80px, #fff, transparent),
    radial-gradient(2px 2px at 500px 200px, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 650px 120px, #ddd, transparent),
    radial-gradient(1px 1px at 800px 300px, rgba(255,255,255,0.9), transparent),
    radial-gradient(2px 2px at 950px 160px, #eee, transparent),
    radial-gradient(1px 1px at 1100px 250px, rgba(255,255,255,0.7), transparent);
  background-repeat: repeat;
  background-size: 400px 300px;
  animation: ${twinkle} 6s infinite;
`;

const GameTitle = styled.h1`
  color: #FFD700;
  font-size: clamp(4rem, 8vw, 8rem);
  margin-bottom: 1rem;
  text-align: center;
  z-index: 10;
  font-family: 'Arial Black', Arial, sans-serif;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-shadow: 
    0 0 20px #FFD700,
    3px 3px 6px rgba(0, 0, 0, 0.8);
  animation: ${glow} 3s ease-in-out infinite;
`;

const GameSubtitle = styled.p`
  color: #87CEEB;
  font-size: clamp(1.2rem, 3vw, 2rem);
  margin-bottom: 4rem;
  text-align: center;
  z-index: 10;
  font-weight: 300;
  letter-spacing: 0.05em;
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
`;

const MenuForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  padding: 3rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${float} 6s ease-in-out infinite;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const InputLabel = styled.label`
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const UsernameInput = styled.input`
  padding: 1rem 1.5rem;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1.1rem;
  width: 300px;
  text-align: center;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FFD700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    transform: scale(1.05);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const MenuButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 250px;
  position: relative;
  overflow: hidden;
  
  background: ${props => props.variant === 'secondary' 
    ? 'linear-gradient(45deg, #4a5568, #2d3748)' 
    : 'linear-gradient(45deg, #4CAF50, #45a049)'};
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: ${props => props.variant === 'secondary' 
      ? 'linear-gradient(45deg, #5a6578, #3d4758)' 
      : 'linear-gradient(45deg, #5cbf60, #4caf50)'};
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 1rem;
  text-align: center;
  margin-top: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const Planet = styled.div<{ size: number; top: string; left: string; delay: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4a90e2, #2c5aa0);
  top: ${props => props.top};
  left: ${props => props.left};
  animation: ${float} ${props => 4 + props.delay}s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.3);
  z-index: 1;
`;

// Nasıl Oynanır Modal Stilleri
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 15px;
  padding: 2rem;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  color: white;
  font-family: 'Arial', sans-serif;
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ModalTitle = styled.h2`
  color: #FFD700;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const ModalSubtitle = styled.p`
  color: #87CEEB;
  font-size: 1.1rem;
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #4CAF50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.3);
  padding-bottom: 0.5rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const FeatureTitle = styled.h4`
  color: #FFD700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const FeatureDesc = styled.p`
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  text-align: center;
`;

const GameplayList = styled.ul`
  color: #ddd;
  line-height: 1.6;
  padding-left: 1.5rem;
`;

const GameplayItem = styled.li`
  margin-bottom: 0.5rem;
`;

const CloseButton = styled.button`
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: block;
  margin: 2rem auto 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: #b71c1c;
    transform: translateY(-2px);
  }
`;

const ProgressionNote = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  color: #FFD700;
  font-style: italic;
  text-align: center;
`;

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onShowScoreboard }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError(t('menu.errors.enterName'));
      return;
    }
    
    if (username.trim().length < 2) {
      setError(t('menu.errors.minLength'));
      return;
    }
    
    if (username.trim().length > 20) {
      setError(t('menu.errors.maxLength'));
      return;
    }
    
    setError('');
    onStartGame(username.trim());
  };

  return (
    <MenuContainer>
      <Stars />
      
      {/* Dil seçici */}
      <LanguageSelector 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100
        }}
      />
      
      {/* Arka plan gezegenleri */}
      <Planet size={60} top="10%" left="10%" delay={0} />
      <Planet size={40} top="20%" left="85%" delay={1} />
      <Planet size={80} top="70%" left="5%" delay={2} />
      <Planet size={50} top="80%" left="90%" delay={1.5} />
      
      <GameTitle>{t('menu.title')}</GameTitle>
      <GameSubtitle>{t('menu.subtitle')}</GameSubtitle>
      
      <MenuForm onSubmit={handleSubmit}>
        <InputContainer>
          <InputLabel>{t('menu.commanderName')}</InputLabel>
          <UsernameInput
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('menu.commanderPlaceholder')}
            maxLength={20}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputContainer>
        
        <ButtonContainer>
          <MenuButton type="submit" disabled={!username.trim()}>
            {t('menu.startGame')}
          </MenuButton>
          <MenuButton type="button" variant="secondary" onClick={() => setShowHowToPlay(true)}>
            {t('menu.howToPlay')}
          </MenuButton>
          <MenuButton type="button" variant="secondary" onClick={onShowScoreboard}>
            {t('menu.leaderboard')}
          </MenuButton>
        </ButtonContainer>
      </MenuForm>

      {/* Nasıl Oynanır Modal */}
      <ModalOverlay isOpen={showHowToPlay}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{t('howToPlay.title')}</ModalTitle>
            <ModalSubtitle>{t('howToPlay.subtitle')}</ModalSubtitle>
          </ModalHeader>

          <Section>
            <SectionTitle>{t('howToPlay.sections.basicGameplay.title')}</SectionTitle>
            <GameplayList>
              <GameplayItem><strong>{t('howToPlay.sections.basicGameplay.items.objective')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.basicGameplay.items.turnSystem')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.basicGameplay.items.planetSelection')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.basicGameplay.items.attack')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.basicGameplay.items.production')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.basicGameplay.items.multiAttack')}</strong></GameplayItem>
            </GameplayList>
          </Section>

          <Section>
            <SectionTitle>{t('howToPlay.sections.planetSizes.title')}</SectionTitle>
            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>🔸</FeatureIcon>
                <FeatureTitle>TINY</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.planetSizes.tiny')}</FeatureDesc>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🔹</FeatureIcon>
                <FeatureTitle>SMALL</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.planetSizes.small')}</FeatureDesc>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🟢</FeatureIcon>
                <FeatureTitle>MEDIUM</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.planetSizes.medium')}</FeatureDesc>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🔵</FeatureIcon>
                <FeatureTitle>LARGE</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.planetSizes.large')}</FeatureDesc>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🟣</FeatureIcon>
                <FeatureTitle>HUGE</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.planetSizes.huge')}</FeatureDesc>
              </FeatureCard>
            </FeatureGrid>
          </Section>

          <Section>
            <SectionTitle>{t('howToPlay.sections.specialPlanets.title')}</SectionTitle>
            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>⚡</FeatureIcon>
                <FeatureTitle>ENERJİ GEZEGENİ</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.specialPlanets.energy')}</FeatureDesc>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🛡️</FeatureIcon>
                <FeatureTitle>KALE GEZEGENİ</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.specialPlanets.fortress')}</FeatureDesc>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🏭</FeatureIcon>
                <FeatureTitle>FABRİKA GEZEGENİ</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.specialPlanets.factory')}</FeatureDesc>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>💎</FeatureIcon>
                <FeatureTitle>NADİR GEZEGEN</FeatureTitle>
                <FeatureDesc style={{ whiteSpace: 'pre-line' }}>{t('howToPlay.sections.specialPlanets.rare')}</FeatureDesc>
              </FeatureCard>
            </FeatureGrid>
            <ProgressionNote style={{ whiteSpace: 'pre-line' }}>
              {t('howToPlay.sections.specialPlanets.progressionNote')}
            </ProgressionNote>
          </Section>

          <Section>
            <SectionTitle>{t('howToPlay.sections.spaceships.title')}</SectionTitle>
            <GameplayList>
              <GameplayItem><strong>{t('howToPlay.sections.spaceships.items.orbit')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.spaceships.items.attack')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.spaceships.items.animation')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.spaceships.items.maximum')}</strong></GameplayItem>
            </GameplayList>
          </Section>

          <Section>
            <SectionTitle>{t('howToPlay.sections.difficulty.title')}</SectionTitle>
            <GameplayList>
              <GameplayItem><strong>{t('howToPlay.sections.difficulty.items.levels1-5')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.difficulty.items.levels6-10')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.difficulty.items.levels11-15')}</strong></GameplayItem>
              <GameplayItem><strong>{t('howToPlay.sections.difficulty.items.levels16-20')}</strong></GameplayItem>
            </GameplayList>
          </Section>

          <CloseButton onClick={() => setShowHowToPlay(false)}>
            {t('howToPlay.readyButton')}
          </CloseButton>
        </ModalContent>
      </ModalOverlay>
    </MenuContainer>
  );
}; 