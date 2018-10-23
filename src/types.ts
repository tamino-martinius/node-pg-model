export interface Dict<T> {
  [key: string]: T;
}
export type Tuple<T, U = T> = [T, U];
