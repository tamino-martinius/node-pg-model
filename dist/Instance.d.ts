import { ModelConstructor, ModelStatic, ModelConstructorClass, Schema } from './types';
export declare class Instance<S extends Schema, M extends ModelStatic<S>, I extends ModelConstructor<S>> extends ModelConstructorClass<S, M, I> {
    instance: I;
    constructor(instance: I);
    readonly model: M;
    assign(attrs: Partial<S>): I;
    revertChange(key: keyof S): I;
    revertChanges(): I;
    save(): Promise<I>;
    delete(): Promise<I>;
    reload(): Promise<I | undefined>;
}
