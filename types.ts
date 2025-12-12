export enum TetrominoType {
  I = 'I',
  O = 'O',
  T = 'T',
  S = 'S',
  Z = 'Z',
  J = 'J',
  L = 'L',
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][]; // The rotation matrix
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export type GridCell = TetrominoType | null;
export type Grid = GridCell[][];

export interface GameState {
  grid: Grid;
  currentPiece: {
    data: Tetromino;
    position: Position;
    rotationIndex: number; // 0, 1, 2, 3
  } | null;
  nextPiece: Tetromino;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
}

export interface CommentaryState {
  text: string;
  emotion: 'neutral' | 'happy' | 'excited' | 'sad';
  isLoading: boolean;
}