const GAME_STATE_KEY = 'wordleGameState';

export type GameState = {
    puzzleDate: string;
    solution: string;
    guesses: string[];
};

const getTodayPuzzleDate = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Returns today's saved game if it exists.
 * Returns null if:
 * - no game exists
 * - the game is from a previous day
 * - localStorage data is corrupted
 */
export const getStoredGameState = (): GameState | null => {
    const gameStateStr = localStorage.getItem(GAME_STATE_KEY);

    if (!gameStateStr) {
        return null;
    }

    try {
        const gameState = JSON.parse(gameStateStr) as GameState;

        // Basic validation
        if (
            typeof gameState.solution !== 'string' ||
            !Array.isArray(gameState.guesses) ||
            typeof gameState.puzzleDate !== 'string'
        ) {
            return null;
        }

        // Ignore previous day's game
        if (gameState.puzzleDate !== getTodayPuzzleDate()) {
            return null;
        }

        return gameState;
    } catch {
        return null;
    }
};

/**
 * Saves the current game.
 */
export const setStoredGameState = (
    solution: string,
    guesses: string[]
) => {
    const gameState: GameState = {
        puzzleDate: getTodayPuzzleDate(),
        solution,
        guesses,
    };

    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
};

/**
 * Removes the current saved game.
 */
export const clearStoredGameState = () => {
    localStorage.removeItem(GAME_STATE_KEY);
};