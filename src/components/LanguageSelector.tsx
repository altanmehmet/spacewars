import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  className?: string;
  style?: React.CSSProperties;
}

const SelectorContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const LanguageButton = styled.button<{ isOpen: boolean }>`
  background: linear-gradient(45deg, #4a5568, #2d3748);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: space-between;
  
  &:hover {
    background: linear-gradient(45deg, #5a6578, #3d4758);
    transform: translateY(-2px);
  }
  
  &::after {
    content: '${props => props.isOpen ? '▲' : '▼'}';
    font-size: 0.7rem;
    transition: transform 0.3s ease;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin-top: 0.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  transform: ${props => props.isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const LanguageOption = styled.button<{ isActive: boolean }>`
  width: 100%;
  background: ${props => props.isActive ? 'rgba(255, 215, 0, 0.2)' : 'transparent'};
  color: ${props => props.isActive ? '#FFD700' : 'white'};
  border: none;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: left;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const languages = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'es', flag: '🇪🇸', name: 'Español' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className, style }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // i18n dil değişimini dinle
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Mevcut dili daha güvenli şekilde al
  const currentLanguage = languages.find(lang => lang.code === currentLang) || 
                         languages.find(lang => lang.code === currentLang?.split('-')[0]) || 
                         languages[0]; // fallback to English
  
  const handleLanguageChange = (languageCode: string) => {
    // Dil değiştir
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <SelectorContainer ref={containerRef} className={className} style={style}>
      <LanguageButton onClick={toggleDropdown} isOpen={isOpen}>
        <span>{currentLanguage.flag} {t('languages.' + currentLanguage.code)}</span>
      </LanguageButton>
      
      <DropdownMenu isOpen={isOpen}>
        {languages.map(language => (
          <LanguageOption
            key={language.code}
            isActive={language.code === currentLang}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span>{language.flag}</span>
            <span>{t('languages.' + language.code)}</span>
          </LanguageOption>
        ))}
      </DropdownMenu>
    </SelectorContainer>
  );
}; 