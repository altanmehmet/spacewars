import { ScoreEntry } from '../types/game';

const SCORES_KEY = 'spacewars_scores';

export const saveScore = (score: ScoreEntry): void => {
  try {
    const existingScores = getScores();
    
    // Aynı kullanıcı adı var mı kontrol et
    const existingUserIndex = existingScores.findIndex(s => s.username === score.username);
    
    if (existingUserIndex !== -1) {
      // Kullanıcı zaten var, skoru güncelle
      existingScores[existingUserIndex] = score;
    } else {
      // Yeni kullanıcı, skoru ekle
      existingScores.push(score);
    }
    
    // Skorları kaydet
    localStorage.setItem(SCORES_KEY, JSON.stringify(existingScores));
  } catch (error) {
    console.error('Skor kaydedilirken hata:', error);
  }
};

export const getScores = (): ScoreEntry[] => {
  try {
    const savedScores = localStorage.getItem(SCORES_KEY);
    if (savedScores) {
      return JSON.parse(savedScores);
    }
  } catch (error) {
    console.error('Skorlar yüklenirken hata:', error);
  }
  return [];
};

export const clearScores = (): void => {
  try {
    localStorage.removeItem(SCORES_KEY);
  } catch (error) {
    console.error('Skorlar silinirken hata:', error);
  }
};

export const checkExistingUser = (username: string): boolean => {
  const scores = getScores();
  return scores.some(score => score.username === username);
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 