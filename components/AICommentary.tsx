import React, { useEffect, useState } from 'react';
import { generateGameCommentary } from '../services/geminiService';
import { Bot, Sparkles } from 'lucide-react';

interface AICommentaryProps {
    linesCleared: number; // Just the recent clear amount
    score: number;
    level: number;
    gameOver: boolean;
    gameStarted: boolean;
    lastClearTimestamp: number | undefined; // To trigger effect
}

const AICommentary: React.FC<AICommentaryProps> = ({ linesCleared, score, level, gameOver, gameStarted, lastClearTimestamp }) => {
    const [comment, setComment] = useState<string>("Ready to play? Let's stack some blocks!");
    const [loading, setLoading] = useState(false);

    // Initial Start
    useEffect(() => {
        if (gameStarted && !gameOver && score === 0) {
            setLoading(true);
            generateGameCommentary('start', {})
                .then(text => text && setComment(text))
                .finally(() => setLoading(false));
        }
    }, [gameStarted, gameOver, score]);

    // Game Over
    useEffect(() => {
        if (gameOver && gameStarted) {
            setLoading(true);
            generateGameCommentary('game_over', { score })
                .then(text => text && setComment(text))
                .finally(() => setLoading(false));
        }
    }, [gameOver, gameStarted, score]);

    // Line Clears
    useEffect(() => {
        if (linesCleared > 0 && lastClearTimestamp) {
            // Only comment on significant moves or randomly to save API quota/noise
            if (linesCleared >= 4 || Math.random() > 0.7) {
                setLoading(true);
                generateGameCommentary('line_clear', { linesCleared })
                    .then(text => text && setComment(text))
                    .finally(() => setLoading(false));
            }
        }
    }, [linesCleared, lastClearTimestamp]);

    // Level Up (Check local logic or pass previous level ref, simpler to just assume every 10 lines roughly)
    // We will skip specific level up trigger here to keep it simple, line clear covers it mostly.

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 p-4 rounded-xl shadow-lg w-full mt-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-purple-500"></div>
            <div className="flex items-center gap-2 text-cyan-400 font-display text-xs uppercase tracking-widest">
                <Bot size={16} />
                <span>AI Assistant</span>
            </div>
            <div className="min-h-[60px] flex items-center">
                {loading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
                        <Sparkles size={14} /> Thinking...
                    </div>
                ) : (
                    <p className="text-slate-200 text-sm leading-relaxed italic">
                        "{comment}"
                    </p>
                )}
            </div>
        </div>
    );
};

export default AICommentary;
