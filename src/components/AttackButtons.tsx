import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { AttackPercentage } from '../types/game';

interface AttackButtonsProps {
  onAttack: (percentage: AttackPercentage) => void;
  disabled: boolean;
}

const ButtonContainer = styled.div`
  display: flex;
  gap: 3px;
  justify-content: center;
  align-items: center;
`;

const AttackButton = styled.button<{ percentage: AttackPercentage }>`
  padding: 3px 5px;
  border: none;
  border-radius: 3px;
  font-weight: bold;
  font-size: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => {
    switch (props.percentage) {
      case AttackPercentage.TWENTY_FIVE:
        return '#FF9800';
      case AttackPercentage.FIFTY:
        return '#FF5722';
      case AttackPercentage.HUNDRED:
        return '#D32F2F';
      default:
        return '#666';
    }
  }};
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  min-width: 30px;
  height: 20px;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const PercentageLabel = styled.div`
  font-size: 5px;
  margin-top: 1px;
  opacity: 0.9;
  line-height: 1;
`;

export const AttackButtons: React.FC<AttackButtonsProps> = ({ 
  onAttack, 
  disabled 
}) => {
  const { t } = useTranslation();
  
  return (
    <ButtonContainer>
      <AttackButton
        percentage={AttackPercentage.TWENTY_FIVE}
        onClick={() => onAttack(AttackPercentage.TWENTY_FIVE)}
        disabled={disabled}
      >
        <div>%25</div>
        <PercentageLabel>{t('game.attackTypes.light')}</PercentageLabel>
      </AttackButton>
      
      <AttackButton
        percentage={AttackPercentage.FIFTY}
        onClick={() => onAttack(AttackPercentage.FIFTY)}
        disabled={disabled}
      >
        <div>%50</div>
        <PercentageLabel>{t('game.attackTypes.medium')}</PercentageLabel>
      </AttackButton>
      
      <AttackButton
        percentage={AttackPercentage.HUNDRED}
        onClick={() => onAttack(AttackPercentage.HUNDRED)}
        disabled={disabled}
      >
        <div>%100</div>
        <PercentageLabel>{t('game.attackTypes.full')}</PercentageLabel>
      </AttackButton>
    </ButtonContainer>
  );
}; 