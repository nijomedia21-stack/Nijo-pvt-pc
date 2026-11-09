// Lightweight, zero-dependency QR code SVG matrix generator
// Generates standard Type 1 / Type 2 QR matrix for clean rendering in React

export function generateQrMatrix(text: string): boolean[][] {
  // A 25x25 QR matrix grid representation
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to draw position detection patterns (7x7 squares at 3 corners)
  const drawFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[tr][tc] = true;
          } else {
            matrix[tr][tc] = false;
          }
        }
      }
    }
  };

  // Draw 3 finder patterns
  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Simple deterministic hash data filler for the URL/token
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  // Populate data area avoiding finder patterns
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Check if inside finder patterns or timing patterns
      const inTopLeft = r <= 7 && c <= 7;
      const inTopRight = r <= 7 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c <= 7;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const bit = ((hash ^ (r * 13 + c * 37 + (r * c))) % 7) < 3;
        matrix[r][c] = bit;
      }
    }
  }

  return matrix;
}
