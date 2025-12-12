import React from 'react';
import { useTetris } from './hooks/useTetris';
import Board from './components/Board';
import NextPiece from './components/NextPiece';
import Controls from './components/Controls';
import AICommentary from './components/AICommentary';
import { Trophy, Layers, Activity } from 'lucide-react';

const App: React.FC = () => {
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    moveLeft, 
    moveRight, 
    rotate, 
    drop, 
    hardDrop,
    lastClearType
  } = useTetris();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
          NEON TETRIS
        </h1>
        <p className="text-slate-400 text-xs tracking-[0.3em] mt-1 uppercase">21 Rows • AI Enhanced</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start max-w-5xl w-full">
        
        {/* Left Panel: Score & Stats (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-48 order-2 lg:order-1">
           <StatBox icon={<Trophy size={20} className="text-yellow-400"/>} label="Score" value={gameState.score} />
           <StatBox icon={<Layers size={20} className="text-green-400"/>} label="Lines" value={gameState.lines} />
           <StatBox icon={<Activity size={20} className="text-red-400"/>} label="Level" value={gameState.level} />
        </div>

        {/* Center: Game Board */}
        <div className="relative order-1 lg:order-2 self-center">
             <Board gameState={gameState} />
             {/* Mobile Stats Overlay (Top of board) */}
             <div className="lg:hidden absolute -top-12 left-0 right-0 flex justify-between px-2 text-sm font-display text-slate-300">
                <span>Score: {gameState.score}</span>
                <span>Lvl: {gameState.level}</span>
             </div>
             
             {/* Game Over Overlay */}
             {gameState.gameOver && (
                 <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg border-4 border-red-500/50">
                     <h2 className="text-4xl font-display text-red-500 font-bold mb-2">GAME OVER</h2>
                     <p className="text-xl mb-6 text-slate-300">Final Score: {gameState.score}</p>
                     <button 
                        onClick={startGame}
                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse"
                     >
                        Retry
                     </button>
                 </div>
             )}
             
             {/* Pause Overlay */}
             {gameState.isPaused && !gameState.gameOver && (
                 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg">
                     <h2 className="text-3xl font-display text-yellow-400 font-bold tracking-widest">PAUSED</h2>
                 </div>
             )}
        </div>

        {/* Right Panel: Next Piece, Controls, AI */}
        <div className="flex flex-col gap-4 w-full lg:w-64 order-3">
             <div className="flex gap-4 lg:flex-col">
                <div className="flex-1">
                    <NextPiece piece={gameState.nextPiece} />
                </div>
                {/* Mobile Stats Logic for Right side if needed, or keeping it hidden */}
             </div>
             
             <AICommentary 
                linesCleared={lastClearType?.count || 0}
                lastClearTimestamp={lastClearType?.time}
                score={gameState.score}
                level={gameState.level}
                gameOver={gameState.gameOver}
                gameStarted={gameState.score > 0 || gameState.lines > 0 || gameState.currentPiece !== null}
             />

             <Controls 
                onLeft={moveLeft}
                onRight={moveRight}
                onRotate={rotate}
                onDown={drop}
                onDrop={hardDrop}
                onPause={pauseGame}
                onStart={startGame}
                isPaused={gameState.isPaused}
                gameOver={gameState.gameOver}
                gameStarted={gameState.currentPiece !== null || gameState.gameOver}
             />
        </div>
      </div>
      
      <div className="mt-8 text-slate-600 text-xs text-center max-w-md">
          Powered by React 18, Tailwind CSS & Google Gemini AI. 
          <br/>
          Use Arrow Keys to move, Up to rotate, Space to hard drop.
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: number, icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-slate-800 border-l-4 border-slate-600 p-4 rounded-r-lg shadow-md flex flex-col">
        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
            {icon} {label}
        </div>
        <div className="text-2xl font-display text-white">
            {value}
        </div>
    </div>
);

export default App;
