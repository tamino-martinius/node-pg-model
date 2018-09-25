import {
  ModelConstructor,
  ModelStatic,
  Schema,
  Connector,
  BaseType,
} from './types';

export function getConnector<S extends Schema>(): Connector<S> {
  return {
    query(model: ModelStatic<S>): Promise<ModelConstructor<S>[]> {
      throw 'not yet implemented';
    },
    count(model: ModelStatic<S>): Promise<number> {
      throw 'not yet implemented';
    },
    select(model: ModelStatic<S>, keys: (keyof S)[]): Promise<S[keyof S][][]> {
      throw 'not yet implemented';
    },
    updateAll(model: ModelStatic<S>, attrs: Partial<S>): Promise<number> {
      throw 'not yet implemented';
    },
    deleteAll(model: ModelStatic<S>): Promise<number> {
      throw 'not yet implemented';
    },
    create(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      throw 'not yet implemented';
    },
    update(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      throw 'not yet implemented';
    },
    delete(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      throw 'not yet implemented';
    },
    execute(query: string, bindings: (BaseType | BaseType[])[]): Promise<any[]> {
      throw 'not yet implemented';
    },
  };
}
