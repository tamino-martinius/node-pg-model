var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { column, Model, } from '.';
class User extends Model {
    constructor(attrs) {
        super(attrs);
    }
    get addresses() {
        return Address.queryBy().userId(this.id);
    }
}
User.tableName = 'User';
__decorate([
    column()
], User.prototype, "id", void 0);
__decorate([
    column()
], User.prototype, "firstName", void 0);
__decorate([
    column()
], User.prototype, "lastName", void 0);
class Address extends Model {
    constructor(attrs) {
        super(attrs);
    }
    get user() {
        return User.findBy().id(this.userId);
    }
}
Address.tableName = 'Addresss';
__decorate([
    column()
], Address.prototype, "id", void 0);
__decorate([
    column()
], Address.prototype, "userId", void 0);
__decorate([
    column()
], Address.prototype, "street", void 0);
__decorate([
    column()
], Address.prototype, "city", void 0);
//# sourceMappingURL=example.mjs.map