"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class Model extends types_1.ModelStaticClass {
    constructor(model) {
        super();
        this.model = model;
    }
    limitBy(amount) {
        return this.model.limitBy(amount);
    }
    get unlimited() {
        return this.model.unlimited;
    }
    skipBy(amount) {
        return this.model.skipBy(amount);
    }
    get unskipped() {
        return this.model.unskipped;
    }
    orderBy(order) {
        return this.model.orderBy(order);
    }
    reorder(order) {
        return this.model.reorder(order);
    }
    get unordered() {
        return this.model.unordered;
    }
    filterBy(filter) {
        return this.model.filterBy(filter);
    }
    get queryBy() {
        return this.model.queryBy;
    }
    get unfiltered() {
        return this.model.unfiltered;
    }
    get all() {
        return this.model.all;
    }
    pluck(column) {
        return this.model.pluck(column);
    }
    select(columns) {
        return this.model.select(columns);
    }
    updateAll(attrs) {
        return this.model.updateAll(attrs);
    }
    deleteAll() {
        return this.model.deleteAll();
    }
    inBatchesOf(amount) {
        return this.model.inBatchesOf(amount);
    }
    get first() {
        return this.model.first;
    }
    find(query) {
        return this.model.find(query);
    }
    get findBy() {
        return this.model.findBy;
    }
    get count() {
        return this.model.count;
    }
    build(attrs) {
        return this.model.build(attrs);
    }
    create(attrs) {
        return this.model.create(attrs);
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map