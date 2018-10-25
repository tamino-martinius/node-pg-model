export interface Dict<T> {
    [key: string]: T;
}
export declare type Tuple<T, U = T> = [T, U];
export declare type Required<T> = T extends object ? {
    [P in keyof T]-?: NonNullable<T[P]>;
} : T;
