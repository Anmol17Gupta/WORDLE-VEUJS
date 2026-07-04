type Props = {
    open: boolean;
    won: boolean;
    solution: string;
    onPlayAgain: () => void;
};

export const GameOverModal = ({
    open,
    won,
    solution,
    onPlayAgain,
}: Props) => {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-sm rounded-xl bg-slate-800 p-6 shadow-2xl">

                <h2 className="text-center text-3xl font-bold text-white">
                    {won ? "🎉 Congratulations!" : "Game Over"}
                </h2>

                <p className="mt-4 text-center text-lg text-slate-200">
                    {won
                        ? "You guessed the word!"
                        : `The word was "${solution}"`}
                </p>

                <button
                    type="button"
                    onClick={onPlayAgain}
                    className="mt-8 w-full rounded-lg bg-green-600 py-3 text-lg font-semibold text-white transition hover:bg-green-500"
                >
                    Play Again
                </button>

            </div>
        </div>
    );
};