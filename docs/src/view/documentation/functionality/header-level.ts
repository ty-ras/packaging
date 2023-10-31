export const ensureHeaderLevel = (headerLevel: number) =>
  (headerLevel < 1 ? 1 : headerLevel > 6 ? 6 : headerLevel) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6;
