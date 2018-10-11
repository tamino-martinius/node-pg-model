"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const getConnector_1 = require("./getConnector");
const util_1 = require("./util");
const Model_1 = require("./Model");
const Instance_1 = require("./Instance");
const pg_1 = require("pg");
function createBaseModel() {
    var Class_1;
    let Class = Class_1 = class Class {
        constructor(attrs) {
            this.persistentAttributes = {};
            this.assign(attrs);
        }
        static get keys() {
            const keys = [];
            for (const key in this.columns) {
                keys.push(key);
            }
            return keys;
        }
        static get columnNames() {
            if (this.cachedColumnNames) {
                return this.cachedColumnNames;
            }
            const columnNames = {};
            for (const column in this.columns) {
                const pgColumnName = util_1.camelToSnakeCase(column);
                columnNames[column] = pgColumnName;
                columnNames[pgColumnName] = column;
            }
            return this.cachedColumnNames = columnNames;
        }
        static getTyped() {
            return new Model_1.Model(this);
        }
        static limitBy(amount) {
            var _a;
            return _a = class extends this {
                },
                _a.limit = amount,
                _a;
        }
        static get unlimited() {
            var _a;
            return _a = class extends this {
                },
                _a.limit = undefined,
                _a;
        }
        static skipBy(amount) {
            var _a;
            return _a = class extends this {
                },
                _a.skip = amount,
                _a;
        }
        static get unskipped() {
            var _a;
            return _a = class extends this {
                },
                _a.skip = undefined,
                _a;
        }
        static orderBy(order) {
            var _a;
            const currentOrder = this.order;
            return _a = class extends this {
                },
                _a.order = [...currentOrder, order],
                _a;
        }
        static reorder(order) {
            var _a;
            return _a = class extends this {
                },
                _a.order = [order],
                _a;
        }
        static get unordered() {
            var _a;
            return _a = class extends this {
                },
                _a.order = [],
                _a;
        }
        static filterBy(filter) {
            var _a;
            const currentFilter = this.filter;
            return _a = class extends this {
                },
                _a.filter = { $and: [currentFilter, filter] },
                _a;
        }
        static get unfiltered() {
            var _a;
            return _a = class extends this {
                },
                _a.filter = {},
                _a;
        }
        static get queryBy() {
            const queryBy = {};
            for (const key in this.columns) {
                queryBy[key] = value => this.filterBy(Array.isArray(value)
                    ? { $in: { [key]: value } }
                    : { [key]: value });
            }
            return queryBy;
        }
        static get all() {
            return this.connector.query(this);
        }
        static updateAll(attrs) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.connector.updateAll(this, attrs);
                return this;
            });
        }
        static deleteAll() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.connector.deleteAll(this);
                return this;
            });
        }
        static inBatchesOf(amount) {
            return __awaiter(this, void 0, void 0, function* () {
                const count = yield this.count;
                const batchCount = Math.ceil(count / amount);
                if (batchCount > 0 && batchCount < Number.MAX_SAFE_INTEGER) {
                    const subqueries = [];
                    for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
                        const skip = (this.skip || 0) + batchIndex * amount;
                        const limit = batchIndex !== batchCount - 1 ? amount : count - (batchCount - 1) * amount;
                        subqueries.push(this.skipBy(skip).limitBy(limit).all);
                    }
                    return subqueries;
                }
                return [];
            });
        }
        static get first() {
            return this.limitBy(1).all.then(instances => instances[0]);
        }
        static find(filter) {
            return this.filterBy(filter).first;
        }
        static get findBy() {
            const findBy = {};
            for (const key in this.columns) {
                findBy[key] = value => this.find(Array.isArray(value)
                    ? { $in: { [key]: value } }
                    : { [key]: value });
            }
            return findBy;
        }
        static get count() {
            return this.connector.count(this);
        }
        static pluck(column) {
            return __awaiter(this, void 0, void 0, function* () {
                return (yield this.select([column])).map(items => items[0]);
            });
        }
        static select(columns) {
            return this.connector.select(this, columns);
        }
        static execute(query, bindings) {
            return this.connector.execute(this, query, bindings);
        }
        static build(attrs) {
            return new this(attrs);
        }
        static create(attrs) {
            return new this(attrs).save();
        }
        get model() {
            var _a;
            const constructor = this.constructor;
            const identifier = constructor.identifier;
            const query = { [identifier]: this[identifier] };
            return _a = class extends constructor {
                },
                _a.filter = query,
                _a.limit = undefined,
                _a.skip = undefined,
                _a;
        }
        get attributes() {
            const attrs = {};
            for (const key in this.model.columns) {
                attrs[key] = this[key];
            }
            return attrs;
        }
        get isNew() {
            return !this[this.model.identifier];
        }
        get isPersistent() {
            return !this.isNew;
        }
        get isChanged() {
            return Object.keys(this.changes).length > 0;
        }
        get changes() {
            const attributes = this.attributes;
            const changes = {};
            for (const key in this.model.columns) {
                if (attributes[key] !== this.persistentAttributes[key]) {
                    const before = this.persistentAttributes[key];
                    const after = attributes[key];
                    changes[key] = { before, after };
                }
            }
            return changes;
        }
        get changeSet() {
            const attributes = this.attributes;
            const changes = {};
            for (const key in this.model.columns) {
                if (attributes[key] !== this.persistentAttributes[key]) {
                    changes[key] = attributes[key];
                }
            }
            return changes;
        }
        getTyped() {
            return new Instance_1.Instance(this);
        }
        assign(attrs) {
            for (const key in attrs) {
                this[key] = attrs[key];
            }
            return this;
        }
        revertChange(key) {
            this[key] = this.persistentAttributes[key];
            return this;
        }
        revertChanges() {
            for (const key of this.model.keys) {
                this.revertChange(key);
            }
            return this;
        }
        save() {
            return this.isNew
                ? this.model.connector.create(this)
                : this.model.connector.update(this);
        }
        delete() {
            return this.model.connector.delete(this);
        }
        reload() {
            return this.model.first;
        }
    };
    Class.pool = new pg_1.Pool();
    Class.tableName = '';
    Class.identifier = 'id';
    Class.columns = {};
    Class.filter = {};
    Class.limit = undefined;
    Class.skip = undefined;
    Class.order = [];
    Class.connector = getConnector_1.getConnector();
    Class = Class_1 = __decorate([
        util_1.staticImplements()
    ], Class);
    return Class;
}
exports.createBaseModel = createBaseModel;
//# sourceMappingURL=createBaseModel.js.map