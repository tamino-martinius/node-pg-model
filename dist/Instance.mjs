import { ModelConstructorClass, } from './types';
export class Instance extends ModelConstructorClass {
    constructor(instance) {
        super();
        this.instance = instance;
    }
    get model() {
        return this.instance.model;
    }
    assign(attrs) {
        return this.instance.assign(attrs);
    }
    revertChange(key) {
        return this.instance.revertChange(key);
    }
    revertChanges() {
        return this.instance.revertChanges();
    }
    save() {
        return this.instance.save();
    }
    delete() {
        return this.instance.delete();
    }
    reload() {
        return this.instance.reload();
    }
}
//# sourceMappingURL=Instance.mjs.map