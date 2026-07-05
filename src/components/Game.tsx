import classNames from 'classnames';
import {
    BACKSPACE,
    ENTER,
    GAME_ROUNDS,
    GAME_WORD_LEN,
    type LetterState,
} from '../constants.ts';
import { GuessRow } from './GuessRow.tsx';
import { Keyboard } from './Keyboard.tsx';
import { GameOverModal } from './GameOverModal.tsx';

import css from './Game.module.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentGuessReducer } from '../hooks/useCurrentGuessReducer.ts';
import { isValidWord } from '../utils/isValidWord.ts';
import { getTileStates } from '../utils/getTileStates.ts';
import {
    getStoredGameState,
    setStoredGameState,
    clearStoredGameState,
} from '../utils/gameStateStorage.ts';

type Props = {
    solution: string;
    newGame: () => void;
};

export const Game = ({ solution, newGame }: Props) => {
    const [currentGuess, dispatch] = useCurrentGuessReducer();
    const [guesses, setGuesses] = useState<string[]>(() => {
        const storedGame = getStoredGameState();
        return storedGame?.guesses ?? [];
    });

    const [gameCompletionState, setGameCompletion] = useState<
        'active' | 'won' | 'lost'
    >('active');

    const [toastText, setToastText] = useState('');

    const toastTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const shakeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [shakeCurrentRow, setShakeCurrentRow] = useState(false);

    const setGuessesCallback = useCallback(
        (guesses: string[]) => {
            setGuesses(guesses);
            setStoredGameState(solution, guesses);
        },
        [solution]
    );

    const showToast = useCallback((text: string) => {
        clearTimeout(toastTimeout.current);

        setToastText(text);

        toastTimeout.current = setTimeout(() => {
            setToastText('');
        }, 1500);
    }, []);

    const shakeCurrentGuess = useCallback(() => {
        clearTimeout(shakeTimeout.current);

        setShakeCurrentRow(true);

        shakeTimeout.current = setTimeout(() => {
            setShakeCurrentRow(false);
        }, 650);
    }, []);

    const resetGame = useCallback(() => {
        clearTimeout(toastTimeout.current);
        clearTimeout(shakeTimeout.current);

        setToastText('');
        setShakeCurrentRow(false);

        setGuesses([]);
        dispatch({ type: 'clear' });
        setGameCompletion('active');

        clearStoredGameState();
        newGame();
    }, [dispatch, newGame]);

    const submitWord = useCallback(() => {
        if (currentGuess.length !== GAME_WORD_LEN) {
            showToast('Not enough letters');
            shakeCurrentGuess();
            return;
        }

        if (!isValidWord(currentGuess)) {
            showToast('Not a valid word');
            shakeCurrentGuess();
            return;
        }

        setGuessesCallback([...guesses, currentGuess]);
        dispatch({ type: 'clear' });

        // WIN
        if (currentGuess === solution) {
            setTimeout(() => {
                showToast('You won!!!');
            }, 2000);

            setTimeout(() => {
                setGameCompletion('won');
            }, 4000);

            return;
        }

        // LOSE
        if (guesses.length + 1 === GAME_ROUNDS) {
            setTimeout(() => {
                showToast('Better luck next time :(');
            }, 1000);

            setTimeout(() => {
                setGameCompletion('lost');
            }, 2500);
        }
    }, [
        currentGuess,
        dispatch,
        guesses,
        setGuessesCallback,
        shakeCurrentGuess,
        showToast,
        solution,
    ]);

    const onKeyPress = useCallback(
        (key: string) => {
            if (gameCompletionState !== 'active') {
                return;
            }

            if (key === BACKSPACE) {
                dispatch({ type: 'backspace' });
                return;
            }

            if (key === ENTER) {
                submitWord();
                return;
            }

            if (key.length !== 1 || !/[a-zA-Z]/.test(key)) {
                return;
            }

            dispatch({
                type: 'add',
                letter: key.toUpperCase(),
            });
        },
        [dispatch, gameCompletionState, submitWord]
    );

    const onKeyDownEvt = useCallback(
        (evt: KeyboardEvent) => {
            onKeyPress(evt.key);
        },
        [onKeyPress]
    );

    useEffect(() => {
        window.addEventListener('keydown', onKeyDownEvt);

        return () => {
            window.removeEventListener('keydown', onKeyDownEvt);
        };
    }, [onKeyDownEvt]);

    const guessIdxToTileStates = Array.from({
        length: GAME_ROUNDS,
    }).map((_, idx) => {
        const isSubmitted = idx < guesses.length;

        return getTileStates(solution, guesses[idx], isSubmitted);
    });

    const letterToLetterState: { [letter: string]: LetterState } = {};

    guessIdxToTileStates.forEach((tileStates, idx) => {
        const guess = guesses[idx];

        if (!guess) return;

        tileStates.forEach((tileState, letterIdx) => {
            const letter = guess[letterIdx];

            if (
                tileState === 'correct' ||
                letterToLetterState[letter] === 'correct'
            ) {
                letterToLetterState[letter] = 'correct';
                return;
            }

            if (
                tileState === 'wrong-place' ||
                letterToLetterState[letter] === 'wrong-place'
            ) {
                letterToLetterState[letter] = 'wrong-place';
                return;
            }

            if (tileState === 'wrong') {
                letterToLetterState[letter] = 'wrong';
            }
        });
    });

    return (
        <div className="w-full h-full flex justify-center">
            {toastText && (
                <div
                    className={classNames(
                        css.toast,
                        'absolute mt-4 font-bold bg-slate-500 p-4 rounded-md z-10'
                    )}
                >
                    {toastText}
                </div>
            )}

            <div className="w-full max-w-lg max-h-175 flex flex-col items-center justify-between py-8">
                <div className="flex flex-col gap-2">
                    {Array.from({ length: GAME_ROUNDS }).map((_, idx) => {
                        const isCurrentGuess = idx === guesses.length;

                        return (
                            <GuessRow
                                key={idx}
                                guess={
                                    isCurrentGuess
                                        ? currentGuess
                                        : guesses[idx]
                                }
                                letterStates={guessIdxToTileStates[idx]}
                                shake={shakeCurrentRow && isCurrentGuess}
                                jump={
                                    gameCompletionState === 'won' &&
                                    idx === guesses.length - 1
                                }
                            />
                        );
                    })}
                </div>

                <Keyboard
                    onKeyPress={onKeyPress}
                    letterToLetterState={letterToLetterState}
                />

                <GameOverModal
                    open={gameCompletionState !== 'active'}
                    won={gameCompletionState === 'won'}
                    solution={solution}
                    onPlayAgain={resetGame}
                />
            </div>
        </div>
    );
};