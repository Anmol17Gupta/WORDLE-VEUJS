import classNames from 'classnames';
import { type LetterState, GAME_WORD_LEN } from '../constants.ts';

import css from './GuessRow.module.css';
import { useEffect, useState } from 'react';

type Props = {
    guess: string | undefined;
    letterStates: Array<LetterState>;
    shake: boolean;
    jump: boolean;
};

export const GuessRow = ({ guess, letterStates, shake, jump }: Props) => {
    return (
        <div className={classNames('flex gap-2', { [css.shake]: shake })}>
            {Array.from({ length: GAME_WORD_LEN }).map((_, idx) => {
                return (
                    <Tile
                        key={idx}
                        idx={idx}
                        letter={guess ? guess[idx] : ''}
                        state={letterStates[idx]}
                        jump={jump}
                    />
                );
            })}
        </div>
    );
};

type TileProps = {
    letter: string | undefined;
    state: LetterState;
    idx: number;
    jump: boolean;
};

export const Tile = ({ letter, state, idx, jump }: TileProps) => {
    const [revealColor, setRevealColor] = useState(false);
    const animationDelay = jump ? idx*80 : idx*300;

    useEffect(() => {
        let timeout: number | undefined;
        if (state !== 'default') {
            timeout = window.setTimeout(() => {
                setRevealColor(true);
            }, animationDelay + 300);
        }
        return () => {
            if (timeout !== undefined) {
                clearTimeout(timeout);
            }
        };
    }, [animationDelay, state]);

    return (
        <div
            style={{
                animationDelay: state === 'default' ? '0ms' : `${animationDelay}ms`,
            }}
            className={classNames(
                'border flex justify-center items-center text-3xl font-bold w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
                {
                    'border-gray-500': state === 'default' && !letter,
                    [css.hasLetter]: !!letter,
                    [css.correct]: state === 'correct' && revealColor,
                    [css.wrong]: state === 'wrong' && revealColor,
                    [css.wrongPlace]: state === 'wrong-place' && revealColor,
                    [css.flip]: state !== 'default',
                    [css.jump]: jump,
                }
            )}
        >
            {letter}
        </div>
    );
};