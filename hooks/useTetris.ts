import { useState, useEffect, useCallback, useRef } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOS, SHAPES } from '../constants';
import { GameState, Grid, Tetromino, TetrominoType } from '../types';

// Helper to create empty grid
const createGrid = (): Grid => 
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

const getRandomTetromino = (): Tetromino => {
  const rand = Math.floor(Math.random() * TETROMINOS.length);
  return TETROMINOS[rand];
};

export const useTetris = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: createGrid(),
    currentPiece: null,
    nextPiece: getRandomTetromino(),
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    isPaused: false,
  });

  const [lastClearType, setLastClearType] = useState<{ count: number, time: number } | null>(null);

  // Use refs for values that change frequently to avoid stale closures in event listeners/intervals if we aren't careful
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const spawnPiece = useCallback(() => {
    const { nextPiece, grid } = gameStateRef.current;
    
    // Check if spawn location is blocked (Game Over condition)
    // Most pieces spawn top-center.
    // Adjust y to 0 for the top visible row
    const startX = Math.floor(BOARD_WIDTH / 2) - 2;
    const startY = 0; 
    
    // Simple collision check for spawn
    const shape = SHAPES[nextPiece.type][0];
    let collision = false;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
             if (grid[startY + y] && grid[startY + y][startX + x]) {
                 collision = true;
             }
        }
      }
    }

    if (collision) {
      setGameState(prev => ({ ...prev, gameOver: true, currentPiece: null }));
      return;
    }

    const newPiece = {
      data: nextPiece,
      position: { x: startX, y: startY },
      rotationIndex: 0,
    };

    setGameState(prev => ({
      ...prev,
      currentPiece: newPiece,
      nextPiece: getRandomTetromino(),
    }));
  }, []);

  const checkCollision = useCallback((x: number, y: number, shape: number[][], grid: Grid) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const newX = x + col;
          const newY = y + row;

          // Wall bounds
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
          // Existing blocks
          if (newY >= 0 && grid[newY][newX]) return true;
        }
      }
    }
    return false;
  }, []);

  const lockPiece = useCallback(() => {
    const { currentPiece, grid, score, level, lines } = gameStateRef.current;
    if (!currentPiece) return;

    const newGrid = grid.map(row => [...row]);
    const shape = SHAPES[currentPiece.data.type][currentPiece.rotationIndex];
    const { x, y } = currentPiece.position;

    // Place piece
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
           if (newGrid[y + row] !== undefined) {
             newGrid[y + row][x + col] = currentPiece.data.type;
           }
        }
      }
    }

    // Check lines
    let clearedLines = 0;
    const finalGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) clearedLines++;
      return !isFull;
    });

    // Add new empty rows at top
    while (finalGrid.length < BOARD_HEIGHT) {
      finalGrid.unshift(Array(BOARD_WIDTH).fill(null));
    }

    // Scoring (Nintendo system)
    const linePoints = [0, 40, 100, 300, 1200];
    const points = linePoints[clearedLines] * level;
    
    const newLines = lines + clearedLines;
    const newLevel = Math.floor(newLines / 10) + 1;

    if (clearedLines > 0) {
        setLastClearType({ count: clearedLines, time: Date.now() });
    }

    setGameState(prev => ({
      ...prev,
      grid: finalGrid,
      score: score + points,
      lines: newLines,
      level: newLevel,
      currentPiece: null, // Ready for next spawn
    }));

  }, [checkCollision]);

  const move = useCallback((dirX: number, dirY: number) => {
    const { currentPiece, grid, gameOver, isPaused } = gameStateRef.current;
    if (!currentPiece || gameOver || isPaused) return false;

    const shape = SHAPES[currentPiece.data.type][currentPiece.rotationIndex];
    const nextX = currentPiece.position.x + dirX;
    const nextY = currentPiece.position.y + dirY;

    if (!checkCollision(nextX, nextY, shape, grid)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: {
            ...prev.currentPiece!,
            position: { x: nextX, y: nextY }
        }
      }));
      return true;
    }
    return false;
  }, [checkCollision]);

  const rotate = useCallback(() => {
    const { currentPiece, grid, gameOver, isPaused } = gameStateRef.current;
    if (!currentPiece || gameOver || isPaused) return;

    const nextRotation = (currentPiece.rotationIndex + 1) % 4;
    const nextShape = SHAPES[currentPiece.data.type][nextRotation];
    const { x, y } = currentPiece.position;

    // Basic Wall Kicks (Try center, then left, then right, then up (rare))
    const kicks = [
      { x: 0, y: 0 },   // Original
      { x: -1, y: 0 },  // Left 1
      { x: 1, y: 0 },   // Right 1
      { x: -2, y: 0 },  // Left 2 (for I piece)
      { x: 2, y: 0 },   // Right 2 (for I piece)
    ];

    for (const kick of kicks) {
      if (!checkCollision(x + kick.x, y + kick.y, nextShape, grid)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: {
            ...prev.currentPiece!,
            rotationIndex: nextRotation,
            position: { x: x + kick.x, y: y + kick.y }
          }
        }));
        return;
      }
    }
  }, [checkCollision]);

  const drop = useCallback(() => {
    const moved = move(0, 1);
    if (!moved) {
      lockPiece();
    }
    return moved;
  }, [move, lockPiece]);

  const hardDrop = useCallback(() => {
    const { currentPiece, grid, gameOver, isPaused } = gameStateRef.current;
    if (!currentPiece || gameOver || isPaused) return;

    let dropDistance = 0;
    const shape = SHAPES[currentPiece.data.type][currentPiece.rotationIndex];
    const { x, y } = currentPiece.position;

    // Calculate max drop
    while (!checkCollision(x, y + dropDistance + 1, shape, grid)) {
        dropDistance++;
    }

    // Update state to bottom immediately and lock
    setGameState(prev => ({
        ...prev,
        currentPiece: {
            ...prev.currentPiece!,
            position: { x, y: y + dropDistance }
        }
    }));
    
    // We need to trigger lock in the next cycle or immediately. 
    // Doing it immediately requires updating the grid ref.
    // To simplify, we rely on the `useEffect` loop or manually call lock logic.
    // However, since state update is async, we can't call lockPiece immediately with the *new* state.
    // Instead, we force the lock logic here with calculated positions.
    
    // Actually, simpler approach: Loop the move(0, 1) until it returns false.
    // But since move() sets state, that causes many renders.
    // Better: calculate final pos, set state, then set a flag to lock on next tick? 
    // Or just manually perform the grid update here.
    
    // Let's manually perform the lock-like logic here for instant update.
    // But we need to reuse lockPiece logic. 
    // To avoid code duplication, let's just use the `dropDistance` to place it in the right spot, 
    // wait for 50ms, then lock. This gives a nice "thud" visual.
    
    setTimeout(() => {
        // We force a lock check.
        // In reality, the interval will pick it up, or we can trigger it.
        // But the interval might move it again? No, collision check will fail.
        lockPiece(); 
    }, 10);

  }, [checkCollision, lockPiece]); // Removed move from dependencies to avoid loop, though not strictly necessary if handled well.


  // Game Loop
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver && !gameState.isPaused) {
      spawnPiece();
    }
  }, [gameState.currentPiece, gameState.gameOver, gameState.isPaused, spawnPiece]);

  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    // Speed formula: (0.8-((Level-1)*0.007))^(Level-1) seconds roughly, or simple linear reduction.
    // Standard Tetris: speed increases significantly.
    const speed = Math.max(100, 1000 - (gameState.level - 1) * 100); 

    const intervalId = setInterval(() => {
      drop();
    }, speed);

    return () => clearInterval(intervalId);
  }, [gameState.gameOver, gameState.isPaused, gameState.level, drop]);

  // Key Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;
      
      if (e.code === 'KeyP') {
          setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
          return;
      }

      if (gameState.isPaused) return;

      switch (e.code) {
        case 'ArrowLeft':
          move(-1, 0);
          break;
        case 'ArrowRight':
          move(1, 0);
          break;
        case 'ArrowDown':
          drop();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case 'Space':
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameOver, gameState.isPaused, move, rotate, drop, hardDrop]);

  const startGame = useCallback(() => {
      setGameState({
        grid: createGrid(),
        currentPiece: null,
        nextPiece: getRandomTetromino(),
        score: 0,
        lines: 0,
        level: 1,
        gameOver: false,
        isPaused: false,
      });
      setLastClearType(null);
  }, []);

  return { 
      gameState, 
      startGame, 
      pauseGame: () => setGameState(p => ({ ...p, isPaused: !p.isPaused })), 
      moveLeft: () => move(-1, 0),
      moveRight: () => move(1, 0),
      rotate,
      drop,
      hardDrop,
      lastClearType
  };
};
