import React, { useState } from 'react';
import styled from 'styled-components';
import { GameBoard } from './components/GameBoard';
import { MainMenu } from './components/MainMenu';
import { Scoreboard } from './components/Scoreboard';
import { useGameLogic } from './hooks/useGameLogic';
import { Planet as PlanetType, AttackPercentage } from './types/game';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Arial', sans-serif;
`;

const GameTitle = styled.h1`
  color: #FFD700;
  font-size: 48px;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
`;

const GameSubtitle = styled.p`
  color: #ccc;
  font-size: 18px;
  margin-bottom: 40px;
  text-align: center;
  max-width: 600px;
  line-height: 1.5;
`;

const Instructions = styled.div`
  color: #aaa;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  max-width: 600px;
  line-height: 1.6;
`;

type AppState = 'menu' | 'game' | 'scoreboard';

function App() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [username, setUsername] = useState<string>('');
  const { gameState, selectPlanet, executeAttack, clearSelection, nextLevel } = useGameLogic(username);

  const handleStartGame = (userInput: string) => {
    setUsername(userInput);
    setAppState('game');
  };

  const handleShowScoreboard = () => {
    setAppState('scoreboard');
  };

  const handleBackToMenu = () => {
    setAppState('menu');
  };

  const handlePlanetClick = (planet: PlanetType) => {
    selectPlanet(planet);
  };

  const handleAttack = (percentage: AttackPercentage) => {
    executeAttack(percentage);
  };

  const renderContent = () => {
    switch (appState) {
      case 'menu':
        return (
          <MainMenu
            onStartGame={handleStartGame}
            onShowScoreboard={handleShowScoreboard}
          />
        );
      case 'game':
        return (
          <>
            <GameBoard
              gameState={gameState}
              onPlanetClick={handlePlanetClick}
              onAttack={handleAttack}
              onNextLevel={nextLevel}
              onClearSelection={clearSelection}
            />
            <Instructions>
              <strong>🎮 NASIL OYNANIR:</strong><br />
              <br />
              <strong>🎯 Temel Mekanikler:</strong><br />
              1. <strong>Gezegen Seçimi:</strong> Kendi gezegenlerinizi (yeşil) tıklayarak seçin<br />
              2. <strong>Çoklu Seçim:</strong> Birden fazla gezegen seçebilirsiniz (tekrar tıklayarak çıkarabilirsiniz)<br />
              3. <strong>Hedef Seçimi:</strong> Düşman veya tarafsız gezegene tıklayarak hedef belirleyin<br />
              4. <strong>Saldırı:</strong> %25, %50 veya %100 saldırı gücü seçin<br />
              <br />
              <strong>⚔️ Savaş Sistemi:</strong><br />
              • Seçili gezegenlerin toplam askerleri hedefe saldırır<br />
              • Askerler her saniye otomatik üretilir<br />
              • Tüm düşman askerleri yok edildiğinde gezegen ele geçirilir<br />
              <br />
              <strong>🤖 AI Oyuncular:</strong><br />
              • Her bölümde farklı sayıda AI oyuncu bulunur<br />
              • AI'lar sırayla hamle yapar<br />
              • Zorluk seviyesi bölümler ilerledikçe artar<br />
              <br />
              <strong>🏆 Bölüm Sistemi:</strong><br />
              • 5 bölüm bulunur<br />
              • Her bölümde daha fazla gezegen ve AI<br />
              • Tüm düşmanları yenerek bölümü tamamlayın<br />
              <br />
              <strong>🎯 Kazanma Koşulları:</strong><br />
              • Tüm düşman gezegenlerini ele geçirin<br />
              • VEYA düşmanın tüm askerlerini yok edin<br />
              • 5 bölümü tamamlayarak oyunu bitirin!<br />
              <br />
              <strong>💡 İpuçları:</strong><br />
              • Önce tarafsız gezegenleri ele geçirin<br />
              • Büyük gezegenler daha hızlı asker üretir<br />
              • Saldırı gücünü dikkatli seçin<br />
              • Üst çubukta seçim bilgilerini takip edin
            </Instructions>
          </>
        );
      case 'scoreboard':
        return (
          <Scoreboard onBackToMenu={handleBackToMenu} />
        );
      default:
        return null;
    }
  };

  return (
    <AppContainer>
      <GameTitle>SpaceWars</GameTitle>
      <GameSubtitle>
        Gezegen Fetih Strateji Oyunu
      </GameSubtitle>
      {renderContent()}
    </AppContainer>
  );
}

export default App;
