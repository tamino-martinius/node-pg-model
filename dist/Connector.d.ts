import { BaseType, Model } from './Model';
import { Dict } from './types';
export declare class Connector {
    query(model: typeof Model): Promise<Model[]>;
    count(model: typeof Model): Promise<number>;
    select(model: typeof Model, columns: string[]): Promise<Dict<any>[]>;
    updateAll(model: typeof Model, attrs: Dict<any>): Promise<number>;
    deleteAll(model: typeof Model): Promise<number>;
    create(instance: Model): Promise<Model>;
    update(instance: Model): Promise<Model>;
    delete(instance: Model): Promise<Model>;
    execute(model: typeof Model, queryText: string, values: BaseType[]): Promise<Dict<any>[]>;
}
export default Connector;
