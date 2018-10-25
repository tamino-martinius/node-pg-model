import { Dict } from './types';
import { Connector } from './Connector';
import { Pool } from 'pg';
export interface Range<T> {
    from: T;
    to: T;
}
export declare type Schema = Dict<any>;
export declare type BaseType = number | string | boolean | null | undefined;
export declare type FilterIn<S extends Schema> = {
    [K in keyof S]: S[K][];
};
export declare type FilterBetween<S extends Schema> = {
    [K in keyof S]: Range<S[K]>;
};
export interface FilterRaw {
    $bindings: BaseType[];
    $query: string;
}
export declare type Filter<S extends Schema = Dict<any>> = Partial<S> | Partial<FilterSpecial<S>>;
export interface FilterSpecial<S extends Schema> {
    $and: Filter<S>[];
    $not: Filter<S>;
    $or: Filter<S>[];
    $in: Partial<FilterIn<S>>;
    $notIn: Partial<FilterIn<S>>;
    $null: keyof S;
    $notNull: keyof S;
    $between: Partial<FilterBetween<S>>;
    $notBetween: Partial<FilterBetween<S>>;
    $gt: Partial<S>;
    $gte: Partial<S>;
    $lt: Partial<S>;
    $lte: Partial<S>;
    $raw: FilterRaw;
    $async: Promise<Filter<S>>;
}
export declare enum Direction {
    Asc = "ASC",
    Desc = "DESC"
}
export declare type SchemaMapping<S extends Dict<any>, T> = {
    [K in keyof S]: T;
};
export declare type Order<S extends Schema = Dict<any>> = Partial<SchemaMapping<S, Direction>>;
export declare type ColumnMapping = Dict<string>;
export declare type QueryBy<T extends typeof Model, S extends Schema = Dict<any>> = {
    [P in keyof S]: (value: S[P] | S[P][]) => T;
};
export declare type FindBy<T extends Model, S extends Schema = Dict<any>> = {
    [P in keyof S]: (value: S[P] | S[P][]) => Promise<T | undefined>;
};
export declare type Changes<S extends Schema> = {
    [P in keyof S]: {
        before: S[P] | undefined;
        after: S[P] | undefined;
    };
};
export declare function column(): (target: any, propertyKey: string) => void;
export declare class Model {
    static pool: Pool;
    static tableName: string;
    static keys: string[];
    static identifier: string;
    static filter: Filter;
    static limit: number | undefined;
    static skip: number | undefined;
    static order: Order[];
    static connector: Connector;
    static columnNames: Dict<string>;
    persistentAttributes: Dict<any>;
    static limitBy<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, amount: number): M;
    static unlimited<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): M;
    static skipBy<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, amount: number): M;
    static unskipped<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): M;
    static orderBy<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, order: Order<S>): M;
    static reorder<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, order: Order<S>): M;
    static unordered<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): M;
    static filterBy<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, filter: Filter<S>): M;
    static unfiltered<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): M;
    static queryBy<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): QueryBy<M, S>;
    static all<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): Promise<I[]>;
    static updateAll<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, attrs: Partial<S>): Promise<M>;
    static deleteAll<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): Promise<M>;
    static inBatchesOf<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, amount: number): Promise<Promise<I[]>[]>;
    static first<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): Promise<I | undefined>;
    static find<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, filter: Filter<S>): Promise<I | undefined>;
    static findBy<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): FindBy<I, S>;
    static count<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }): Promise<number>;
    static pluck<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, column: string): Promise<any[]>;
    static select<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, columns: string[]): Promise<Dict<any>[]>;
    static execute<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, query: string, bindings: BaseType[]): Promise<Dict<any>[]>;
    constructor(attrs: Dict<any>);
    static build<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, attrs: S): I;
    static create<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: M & {
        new (attrs: S): I;
    }, attrs: S): Promise<I>;
    model<S, I extends Model, M extends typeof Model & {
        new (attrs: S): I;
    }>(this: I): M;
    readonly attributes: Dict<any>;
    readonly isNew: boolean;
    readonly isPersistent: boolean;
    readonly isChanged: boolean;
    readonly changes: Dict<any>;
    readonly changeSet: Dict<any>;
    assign<S, I extends Model, _ extends typeof Model & {
        new (attrs: S): I;
    }>(this: I, attrs: Dict<any>): I;
    revertChange<S, I extends Model, _ extends typeof Model & {
        new (attrs: S): I;
    }>(this: I, key: string): I;
    revertChanges<S, I extends Model, _ extends typeof Model & {
        new (attrs: S): I;
    }>(this: I): I;
    save<S, I extends Model, _ extends typeof Model & {
        new (attrs: S): I;
    }>(this: I): Promise<I>;
    delete<S, I extends Model, _ extends typeof Model & {
        new (attrs: S): I;
    }>(this: I): Promise<I>;
    reload<S, I extends Model, _ extends typeof Model & {
        new (attrs: S): I;
    }>(this: I): Promise<I | undefined>;
}
export default Model;
