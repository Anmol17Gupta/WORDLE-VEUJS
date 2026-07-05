import allowedWords from '../config/allowed_words.json';

export const getRandomWord = (): string => {
    const randomIndex = Math.floor(Math.random() * allowedWords.length);
    return allowedWords[randomIndex].toUpperCase();
};