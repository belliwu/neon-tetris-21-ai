import React, { useMemo } from 'react';
import { GameState, TetrominoType } from '../types';
import { SHAPES, BOARD_HEIGHT, BOARD_WIDTH, COLORS } from '../constants';

interface BoardProps {
  gameState: GameState;
}

const Board: React.FC<BoardProps> = ({ gameState }) => {
  const { grid, currentPiece } = gameState;

  // Merge grid and current piece for rendering
  const displayGrid = useMemo(() => {
    // Deep clone grid to avoid mutation issues during render (though map is safer)
    const renderGrid = grid.map(row => [...row]);

    if (currentPiece) {
      const shape = SHAPES[currentPiece.data.type][currentPiece.rotationIndex];
      const { x, y } = currentPiece.position;

      // Draw Ghost Piece (optional, adds polish)
      // To do this efficiently: calculate ghost Y position
      let ghostY = y;
      let collision = false;
      
      // Helper to check collision locally inside render (duplicated logic, but keeps component pure)
      const checkCol = (gx: number, gy: number) => {
          for(let r=0; r<shape.length; r++){
              for(let c=0; c<shape[r].length; c++){
                  if(shape[r][c]){
                      const nx = gx + c;
                      const ny = gy + r;
                      if(nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return true;
                      if(ny >= 0 && grid[ny][nx]) return true;
                  }
              }
          }
          return false;
      };

      while(!checkCol(x, ghostY + 1)) {
          ghostY++;
      }

      // Render Ghost
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] && renderGrid[ghostY + r] !== undefined) {
             // Only draw ghost if the cell is empty (it should be)
             if (renderGrid[ghostY + r][x + c] === null) {
                 // Use a special marker or just style it in UI
                 // For type safety, we can't put 'ghost' in TetrominoType easily without changing types.
                 // We'll handle this in the cell rendering logic by checking coordinates, 
                 // but modifying the grid array is easier. Let's return a separate "ghost" overlay structure or logic.
                 // Actually, let's just skip ghost for the MVP simplicity to ensure robustness, 
                 // or implement it via CSS opacity if we matched the exact cell.
                 // Let's skip modifying renderGrid for ghost to keep type safety clean.
             }
          }
        }
      }

      // Render Active Piece
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            if (renderGrid[y + r] && renderGrid[y + r][x + c] !== undefined) {
              renderGrid[y + r][x + c] = currentPiece.data.type;
            }
          }
        }
      }
    }
    return renderGrid;
  }, [grid, currentPiece]);

  return (
    <div 
        className="grid grid-rows-[repeat(21,minmax(0,1fr))] grid-cols-10 gap-[1px] bg-slate-800 border-4 border-slate-700 p-1 rounded-lg shadow-2xl shadow-blue-500/20"
        style={{
            // Force aspect ratio roughly for 10x21
            aspectRatio: '10/21',
            height: 'min(80vh, 600px)'
        }}
    >
      {displayGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell key={`${rowIndex}-${colIndex}`} type={cell} />
        ))
      )}
    </div>
  );
};

const Cell: React.FC<{ type: TetrominoType | null }> = React.memo(({ type }) => {
  if (!type) {
    return <div className="bg-slate-900/80 rounded-sm w-full h-full relative" />;
  }

  const colorClass = `bg-${COLORS[type]}`;
  
  return (
    <div className={`w-full h-full rounded-sm relative overflow-hidden ${colorClass} shadow-inner`}>
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
        {/* Glow */}
        <div className={`absolute inset-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
    </div>
  );
});

export default Board;
