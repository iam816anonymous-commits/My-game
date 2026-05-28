export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export const WORDS = [
    'LIGHT', 'DREAM', 'SPACE', 'CLOUD', 'GHOST', 'SHINE', 'GLOWS', 'VOIDY', 'STARS', 'NIGHT',
    'ZENNY', 'PEACE', 'QUIET', 'SOUND', 'VOICE', 'HEART', 'SOULY', 'BRAIN', 'THINK', 'FLAME',
    'WATER', 'OCEAN', 'RIVER', 'EARTH', 'PLANT', 'TREES', 'BLOOM', 'FRUIT', 'SWEET', 'DANCE',
    'MUSIC', 'CLEAR', 'CLEAN', 'FRESH', 'BRIGHT', 'SMALL', 'LARGE', 'POWER', 'GRACE', 'TRUTH'
];

export class WordleLogic {
  static getDailyWord(): string {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    return WORDS[seed % WORDS.length].toUpperCase();
  }

  static checkGuess(guess: string, target: string): LetterStatus[] {
    const result: LetterStatus[] = Array(5).fill('absent');
    const targetArr = target.split('');
    const guessArr = guess.split('');

    // First pass: Correct matches
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = 'correct';
        targetArr[i] = '';
        guessArr[i] = '';
      }
    }

    // Second pass: Present matches
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] !== '' && targetArr.includes(guessArr[i])) {
        result[i] = 'present';
        targetArr[targetArr.indexOf(guessArr[i])] = '';
      }
    }

    return result;
  }

  static isValidWord(word: string): boolean {
    return word.length === 5 && WORDS.includes(word.toUpperCase());
  }
}
