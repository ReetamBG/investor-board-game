export function getGridPosition(index: number, size: number = 32) {
  const maxIdx = size - 1;

  // Top Edge (Left to Right)
  if (index < size) {
    return { gridRow: 1, gridColumn: index + 1 };
  }
  // Right Edge (Top to Bottom)
  if (index < size + maxIdx - 1) {
    return { gridRow: (index - size + 2), gridColumn: size };
  }
  // Bottom Edge (Right to Left)
  if (index < (2 * size) + maxIdx - 2) {
    return { gridRow: size, gridColumn: size - (index - (size + maxIdx - 1)) };
  }
  // Left Edge (Bottom to Top)
  return { gridRow: size - (index - (2 * size + maxIdx - 2)), gridColumn: 1 };
}