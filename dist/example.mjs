import { createBaseModel, } from '.';
class User extends createBaseModel() {
    static get $() {
        return this.getTyped();
    }
    get $() {
        return this.getTyped();
    }
    get addresses() {
        return Address.$.queryBy.userId(this.id);
    }
}
User.tableName = 'User';
User.columns = {
    id: { type: 'Serial' },
    firstName: { type: 'CharVarying' },
    lastName: { type: 'CharVarying' },
};
class Address extends createBaseModel() {
    static get $() {
        return this.getTyped();
    }
    get $() {
        return this.getTyped();
    }
    get user() {
        return User.$.findBy.id(this.userId);
    }
}
Address.tableName = 'Addresss';
Address.columns = {
    id: { type: 'Serial' },
    userId: { type: 'Integer' },
    city: { type: 'CharVarying' },
    street: { type: 'CharVarying' },
};
//# sourceMappingURL=example.mjs.map