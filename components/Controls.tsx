import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, RotateCw, Pause, Play, RefreshCw, ChevronsDown } from 'lucide-react';

interface ControlsProps {
    onLeft: () => void;
    onRight: () => void;
    onRotate: () => void;
    onDown: () => void;
    onDrop: () => void;
    onPause: () => void;
    onStart: () => void;
    isPaused: boolean;
    gameOver: boolean;
    gameStarted: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
    onLeft, onRight, onRotate, onDown, onDrop, onPause, onStart, isPaused, gameOver, gameStarted 
}) => {
  
  // Prevent double tap zoom on mobile buttons
  const touchProps = {
      onTouchStart: (e: React.TouchEvent) => e.stopPropagation()
  };

  return (
    <div className="flex flex-col w-full gap-4 mt-4">
        {/* Game State Buttons */}
        <div className="flex gap-4 justify-center mb-2">
            {!gameStarted || gameOver ? (
                <button 
                    onClick={onStart}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold shadow-lg shadow-green-900/50 transition-all active:scale-95"
                >
                    <Play size={20} fill="currentColor" /> {gameOver ? 'Retry' : 'Start Game'}
                </button>
            ) : (
                <button 
                    onClick={onPause}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-full font-bold shadow-lg shadow-yellow-900/50 transition-all active:scale-95"
                >
                    {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
            )}
        </div>

        {/* D-Pad for Mobile (Hidden on Desktop mostly, or visible for aesthetics) */}
        <div className="grid grid-cols-3 gap-2 sm:hidden w-full max-w-[300px] mx-auto">
            <div className="col-start-2">
                <ControlButton icon={<RotateCw size={24} />} onClick={onRotate} color="bg-purple-600" />
            </div>
            <div className="col-start-1 row-start-2">
                <ControlButton icon={<ArrowLeft size={24} />} onClick={onLeft} color="bg-slate-600" />
            </div>
            <div className="col-start-2 row-start-2">
                <ControlButton icon={<ArrowDown size={24} />} onClick={onDown} color="bg-slate-600" />
            </div>
            <div className="col-start-3 row-start-2">
                <ControlButton icon={<ArrowRight size={24} />} onClick={onRight} color="bg-slate-600" />
            </div>
            <div className="col-start-2 row-start-3">
                 <ControlButton icon={<ChevronsDown size={24} />} onClick={onDrop} color="bg-red-600" />
            </div>
        </div>
        
        <div className="text-center text-xs text-slate-500 hidden sm:block font-display mt-2">
            ARROWS to move • UP to rotate • SPACE to drop
        </div>
    </div>
  );
};

const ControlButton: React.FC<{ icon: React.ReactNode, onClick: () => void, color: string }> = ({ icon, onClick, color }) => (
    <button 
        className={`w-full aspect-square ${color} rounded-xl shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform touch-manipulation`}
        onPointerDown={(e) => {
            e.preventDefault(); // Prevent focus/selection
            onClick();
        }}
    >
        {icon}
    </button>
);

export default Controls;
