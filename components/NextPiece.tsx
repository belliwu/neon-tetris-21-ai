import React from 'react';
import { Tetromino } from '../types';
import { SHAPES, COLORS } from '../constants';

const NextPiece: React.FC<{ piece: Tetromino }> = ({ piece }) => {
  const shape = SHAPES[piece.type][0]; // Default rotation

  return (
    <div className="bg-slate-800 p-4 rounded-lg border-2 border-slate-700 flex flex-col items-center justify-center w-full aspect-square shadow-lg">
      <h3 className="text-slate-400 text-sm font-display mb-4 uppercase tracking-wider">Next</h3>
      <div 
        className="grid gap-[1px]"
        style={{
            gridTemplateRows: `repeat(${shape.length}, 1fr)`,
            gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
        }}
      >
        {shape.map((row, r) => (
          row.map((cell, c) => (
            <div 
                key={`${r}-${c}`} 
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-sm ${cell ? `bg-${COLORS[piece.type]}` : 'bg-transparent'}`} 
            />
          ))
        ))}
      </div>
    </div>
  );
};

export default NextPiece;
