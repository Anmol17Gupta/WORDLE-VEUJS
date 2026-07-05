import { useState } from 'react';
import { Game } from './components/Game.tsx';
import { Header } from './components/Header.tsx';
import { getRandomWord } from './utils/getRandomWord.tsx';
import {
    getStoredGameState,
    setStoredGameState,
} from './utils/gameStateStorage.ts';

function App() {
    const [solution, setSolution] = useState<string>(() => {
        const storedGame = getStoredGameState();

        if (storedGame) {
            return storedGame.solution;
        }

        const newSolution = getRandomWord();

        // Save the new game immediately
        setStoredGameState(newSolution, []);

        return newSolution;
    });

    const startNewGame = () => {
        const newSolution = getRandomWord();

        // Save the new game immediately
        setStoredGameState(newSolution, []);

        setSolution(newSolution);
    };

    return (
        <div className="flex flex-col h-full">
            <Header />
            <Game
                solution={solution}
                newGame={startNewGame}
            />
        </div>
    );
}

export default App;