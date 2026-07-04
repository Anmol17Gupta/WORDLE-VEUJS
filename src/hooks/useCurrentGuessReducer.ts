import { useReducer } from 'react';
import { GAME_WORD_LEN } from '../constants.ts';

type AddLetterAction = {
    type: 'add';
    letter: string;
};

type BackspaceAction = {
    type: 'backspace';
};

type ClearAction = {
    type: 'clear';
};

type Action = AddLetterAction | BackspaceAction | ClearAction;

const reducer = (state: string, action: Action) => {
    if (action.type === 'add'){
        if (state.length === GAME_WORD_LEN) {
            return state;
        }
        return state + action.letter;
    }
    if (action.type === 'backspace') {
        if (state.length !== 0) {
            return state.substring(0, state.length-1);
        }
    }
    if (action.type === 'clear') {
        return '';
    }
    return state;
};

export const useCurrentGuessReducer = () => {
    return useReducer(reducer, '');
};