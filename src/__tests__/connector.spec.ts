import {
  NextModel,
} from '../next_model';

import {
  Schema,
  FilterProperty,
  Filter,
  Identifiable,
} from '../types';

import {
  Storage,
  Connector,
} from '../connector';

import {
  context,
} from './types';

import {
  Faker,
} from '../__mocks__/next_model';

const Model = NextModel<any>();
let storage: Storage | undefined = undefined;
let Klass: typeof Model;
let validId: number = Faker.randomId(3);
let invalidId: number = Faker.randomNumber(4, Number.MAX_SAFE_INTEGER);
let anyId: number = Faker.randomNumber(1, Number.MAX_SAFE_INTEGER);
let singleSeed: Storage;
let multiSeed: Storage;

let connector = () => new Connector(storage);


beforeEach(() => {
  storage = undefined;
  Klass = Faker.model;
  singleSeed = {
    [Klass.modelName]: [
      { id: anyId },
    ],
  };
  multiSeed = {
    [Klass.modelName]: [
      { id: 1, foo: 'bar' },
      { id: 2, foo: null },
      { id: 3, foo: 'bar' },
    ],
  };
});

interface FilterSpecs {
  filter: Filter<any>;
  results: number[] | string
};

interface FilterSpecGroup {
  [key: string]: FilterSpecs[];
};

const filterSpecGroups: FilterSpecGroup = {
  'none': [
    { filter: undefined, results: [1, 2, 3] },
    { filter: {}, results: [1, 2, 3] },
  ],
  'property': [
    { filter: { id: validId }, results: [validId] },
    { filter: { id: 1, foo: 'bar' }, results: [1] },
    { filter: { id: 1, foo: 'baz' }, results: [] },
    { filter: { foo: 'bar' }, results: [1, 3] },
    { filter: { id: invalidId }, results: [] },
  ],
  '$and': [
    { filter: { $and: [] }, results: [1, 2, 3] },
    { filter: { $and: [{ id: validId}] }, results: [validId] },
    { filter: { $and: [{ id: 2 }, { id: 3 }] }, results: [] },
    { filter: { $and: [{ id: 2 }, { id: 2 }] }, results: [2] },
  ],
  '$not': [
    { filter: { $not: {} }, results: [] },
    { filter: { $not: { id: 2 } }, results: [1, 3] },
    { filter: { $not: { id: invalidId } }, results: [1, 2, 3] },
  ],
  '$or': [
    { filter: { $or: [] }, results: [] },
    { filter: { $or: [{ id: validId }] }, results: [validId] },
    { filter: { $or: [{ id: 2 }, { id: 3 }] }, results: [2, 3] },
    { filter: { $or: [{ id: 2 }, { id: 2 }] }, results: [2] },
  ],
  '$in': [
    { filter: { $in: {} }, results: '[TODO] Return proper error' },
    { filter: { $in: { id: [validId] } }, results: [validId] },
    { filter: { $in: { id: [2, 3] } }, results: [2, 3] },
    { filter: { $in: { id: [2, 2] } }, results: [2] },
    { filter: { $in: { id: [1], foo: ['bar'] } }, results: '[TODO] Return proper error' },
  ],
  '$notIn': [
    { filter: { $notIn: {} }, results: '[TODO] Return proper error' },
    { filter: { $notIn: { id: [2] } }, results: [1, 3] },
    { filter: { $notIn: { id: [2, 3] } }, results: [1] },
    { filter: { $notIn: { id: [2, 2] } }, results: [1, 3] },
    { filter: { $notIn: { id: [1], foo: ['bar'] } }, results: '[TODO] Return proper error' },
  ],
  '$null': [
    { filter: { $null: 'foo' }, results: [2] },
    { filter: { $null: 'id' }, results: [] },
    { filter: { $null: 'bar' }, results: [1, 2, 3] },
  ],
  '$notNull': [
    { filter: { $notNull: 'foo' }, results: [1, 3] },
    { filter: { $notNull: 'id' }, results: [1, 2, 3] },
    { filter: { $notNull: 'bar' }, results: [] },
  ],
  '$between': [
    { filter: { $between: {} }, results: '[TODO] Return proper error' },
    { filter: { $between: { id: { from: 1, to: 2 } } }, results: [1, 2] },
    { filter: { $between: { foo: { from: 'a', to: 'z' } } }, results: [1, 3] },
    { filter: { $between: { id: { from: 0, to: 1 } } }, results: [1] },
    { filter: { $between: { id: { from: 3, to: 4 } } }, results: [3] },
    { filter: { $between: { id: { from: validId, to: validId } } }, results: [validId] },
    { filter: { $between: { id: { from: 4, to: 5 } } }, results: [] },
    { filter: { $between: { id: { from: 3, to: 1 } } }, results: [] },
    { filter: { $between: { id: { from: 1, to: 3 }, foo: { from: 'a', to: 'z' } } }, results: '[TODO] Return proper error' },
  ],
  '$gt': [
    { filter: { $gt: {} }, results: '[TODO] Return proper error' },
    { filter: { $gt: { id: 2 } }, results: [3] },
    { filter: { $gt: { foo: 'bar' } }, results: [] },
    { filter: { $gt: { foo: 'a' } }, results: [1, 3] },
    { filter: { $gt: { id: 0 } }, results: [1, 2, 3] },
    { filter: { $gt: { id: invalidId } }, results: [] },
    { filter: { $gt: { id: 1, foo: 'a' } }, results: '[TODO] Return proper error' },
  ],
  '$gte': [
    { filter: { $gte: {} }, results: '[TODO] Return proper error' },
    { filter: { $gte: { id: 2 } }, results: [2, 3] },
    { filter: { $gte: { foo: 'z' } }, results: [] },
    { filter: { $gte: { foo: 'bar' } }, results: [1, 3] },
    { filter: { $gte: { foo: 'a' } }, results: [1, 3] },
    { filter: { $gte: { id: 0 } }, results: [1, 2, 3] },
    { filter: { $gte: { id: invalidId } }, results: [] },
    { filter: { $gte: { id: 1, foo: 'a' } }, results: '[TODO] Return proper error' },
  ],
  '$lt': [
    { filter: { $lt: {} }, results: '[TODO] Return proper error' },
    { filter: { $lt: { id: 2 } }, results: [1] },
    { filter: { $lt: { foo: 'bar' } }, results: [] },
    { filter: { $lt: { foo: 'z' } }, results: [1, 3] },
    { filter: { $lt: { id: 4 } }, results: [1, 2, 3] },
    { filter: { $lt: { id: 0 } }, results: [] },
    { filter: { $lt: { id: 1, foo: 'a' } }, results: '[TODO] Return proper error' },
  ],
  '$lte': [
    { filter: { $lte: {} }, results: '[TODO] Return proper error' },
    { filter: { $lte: { id: 2 } }, results: [1, 2] },
    { filter: { $lte: { foo: 'a' } }, results: [] },
    { filter: { $lte: { foo: 'bar' } }, results: [1, 3] },
    { filter: { $lte: { foo: 'z' } }, results: [1, 3] },
    { filter: { $lte: { id: 4 } }, results: [1, 2, 3] },
    { filter: { $lte: { id: 0 } }, results: [] },
    { filter: { $lte: { id: 1, foo: 'a' } }, results: '[TODO] Return proper error' },
  ],
};

describe('DefaultConnector', () => {
  describe('#query(model)', () => {
    const subject = () => connector().query(Klass);

    it('promises empty array', () => {
      return expect(subject()).resolves.toEqual([]);
    });

    context('with single item prefilled storage', {
      definitions() {
        storage = singleSeed;
      },
      tests() {
        it('promises all items as model instances', () => {
          return expect(subject()).resolves.toEqual([
            new Klass({ id: anyId }),
          ]);
        });
      },
    });

    context('with multiple items prefilled storage', {
      definitions() {
        storage = multiSeed;
      },
      tests() {
        for (const groupName in filterSpecGroups) {
          describe(groupName + ' filter', () => {
            filterSpecGroups[groupName].forEach(filterSpec => {
              context(`with filter '${JSON.stringify(filterSpec.filter)}'`, {
                definitions() {
                  class NewKlass extends Klass {
                    static get filter(): Filter<any> {
                      return filterSpec.filter;
                    }
                  };
                  Klass = NewKlass;
                },
                tests() {
                  const results = filterSpec.results;
                  if (Array.isArray(results)) {
                    if (results.length === 0) {
                      it('promises empty array', () => {
                        return expect(subject()).resolves.toEqual([]);
                      });
                    } else if (results.length === 3) {
                      it('promises all items as model instances', () => {
                        return expect(subject()).resolves.toEqual(
                          results.map(id => new Klass({ id }))
                        );
                      });
                    } else {
                      it('promises all matching items as model instances', () => {
                        return expect(subject()).resolves.toEqual(
                          results.map(id => new Klass({ id }))
                        );
                      });
                    }
                  } else {
                    it('rejects filter and returns error', () => {
                      return expect(subject()).rejects.toEqual(results);
                    });
                  }
                },
              });
            });
          });
        }
      },
    });
  });
});
