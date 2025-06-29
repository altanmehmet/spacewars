import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ScoreEntry } from '../types/game';
import { getScores, clearScores, formatTime, formatDate } from '../utils/scoreManager';

interface ScoreboardProps {
  onBackToMenu: () => void;
}

const ScoreboardContainer = styled.div`
  width: 800px;
  height: 600px;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 2px solid #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

const ScoreboardTitle = styled.h1`
  color: #FFD700;
  font-size: 48px;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  z-index: 10;
`;

const ScoreboardContent = styled.div`
  width: 90%;
  max-height: 400px;
  overflow-y: auto;
  z-index: 10;
`;

const ScoreTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.th`
  background: #333;
  color: #FFD700;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #444;
`;

const TableCell = styled.td`
  padding: 10px 12px;
  color: white;
  border-bottom: 1px solid #333;
`;

const TableRow = styled.tr<{ isHighlighted?: boolean }>`
  background: ${props => props.isHighlighted ? 'rgba(255, 215, 0, 0.1)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const EmptyMessage = styled.div`
  color: #888;
  text-align: center;
  padding: 40px;
  font-size: 18px;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
  z-index: 10;
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'primary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 10px;
  
  background: ${props => {
    if (props.variant === 'danger') return '#d32f2f';
    if (props.variant === 'primary') return '#4CAF50';
    return '#666';
  }};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    background: ${props => {
      if (props.variant === 'danger') return '#b71c1c';
      if (props.variant === 'primary') return '#45a049';
      return '#777';
    }};
  }
`;

const ConfirmationDialog = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #d32f2f;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  z-index: 100;
  min-width: 300px;
`;

const ConfirmationTitle = styled.h3`
  color: #d32f2f;
  margin-bottom: 15px;
  font-size: 20px;
`;

const ConfirmationText = styled.p`
  color: white;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

export const Scoreboard: React.FC<ScoreboardProps> = ({ onBackToMenu }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = () => {
    const savedScores = getScores();
    setScores(savedScores);
  };

  const handleClearScores = () => {
    clearScores();
    setScores([]);
    setShowConfirmation(false);
  };

  const sortedScores = [...scores].sort((a, b) => {
    // Önce tamamlanan bölüm sayısına göre sırala
    if (b.completedLevels !== a.completedLevels) {
      return b.completedLevels - a.completedLevels;
    }
    // Sonra toplam süreye göre sırala (daha hızlı olan önce)
    return a.totalTime - b.totalTime;
  });

  return (
    <ScoreboardContainer>
      <Stars />
      
      <ScoreboardTitle>Skorboard</ScoreboardTitle>
      
      <ScoreboardContent>
        {scores.length === 0 ? (
          <EmptyMessage>
            Henüz hiç skor kaydedilmemiş.<br />
            Oyunu oynayarak ilk skorunuzu oluşturun!
          </EmptyMessage>
        ) : (
          <ScoreTable>
            <thead>
              <tr>
                <TableHeader>Sıra</TableHeader>
                <TableHeader>Kullanıcı</TableHeader>
                <TableHeader>Tamamlanan Bölüm</TableHeader>
                <TableHeader>Toplam Süre</TableHeader>
                <TableHeader>Tarih</TableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedScores.map((score, index) => (
                <TableRow key={index} isHighlighted={index === 0}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{score.username}</TableCell>
                  <TableCell>{score.completedLevels}/5</TableCell>
                  <TableCell>{formatTime(score.totalTime)}</TableCell>
                  <TableCell>{formatDate(score.date)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </ScoreTable>
        )}
      </ScoreboardContent>
      
      <ButtonContainer>
        <ActionButton onClick={onBackToMenu}>
          Ana Menüye Dön
        </ActionButton>
        {scores.length > 0 && (
          <ActionButton variant="danger" onClick={() => setShowConfirmation(true)}>
            Skorları Temizle
          </ActionButton>
        )}
      </ButtonContainer>

      {showConfirmation && (
        <ConfirmationDialog>
          <ConfirmationTitle>Skorları Temizle</ConfirmationTitle>
          <ConfirmationText>
            Tüm skorlar kalıcı olarak silinecektir.<br />
            Bu işlemi gerçekleştirmek istediğinizden emin misiniz?
          </ConfirmationText>
          <ConfirmationButtons>
            <ActionButton variant="danger" onClick={handleClearScores}>
              Evet, Sil
            </ActionButton>
            <ActionButton onClick={() => setShowConfirmation(false)}>
              İptal
            </ActionButton>
          </ConfirmationButtons>
        </ConfirmationDialog>
      )}
    </ScoreboardContainer>
  );
}; 