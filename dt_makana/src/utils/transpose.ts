export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length === 0) return [];
  const cols = matrix[0].length;
  const transposed: T[][] = [];
  for (let i = 0; i < cols; i++) {
    const row: T[] = [];
    for (let j = 0; j < matrix.length; j++) {
      row.push(matrix[j][i]);
    }
    transposed.push(row);
  }
  return transposed;
}
