export interface Dict<T> {
  [key: string]: T;
}
export type Tuple<T, U> = [T, U];

export interface Range<T> {
  from: T;
  to: T;
}

export enum DataType {
  bigInteger,
  binary,
  boolean,
  date,
  dateTime,
  decimal,
  enum,
  float,
  integer,
  json,
  jsonb,
  string,
  text,
  time,
  uuid,
}
