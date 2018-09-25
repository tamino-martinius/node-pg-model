import {
  ModelConstructor,
  ModelStatic,
  ModelConstructorClass,
  Schema,
} from './types';

export class Instance<
  S extends Schema,
  M extends ModelStatic<S>,
  I extends ModelConstructor<S>,
  > extends ModelConstructorClass<S, M, I> {
  constructor(public instance: I) {
    super();
  }

  get model(): M {
    return <any>this.instance.model;
  }

  assign(attrs: Partial<S>): I {
    return <any>this.instance.assign(attrs);
  }

  revertChange(key: keyof S): I {
    return <any>this.instance.revertChange(key);
  }

  revertChanges(): I {
    return <any>this.instance.revertChanges();
  }

  save(): Promise<I> {
    return <any>this.instance.save();
  }

  delete(): Promise<I> {
    return <any>this.instance.delete();
  }

  reload(): Promise<I | undefined> {
    return <any>this.instance.reload();
  }
}
