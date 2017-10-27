import {
  Model,
  NextModel,
  Query,
} from '../next_model';

import {
  Storage,
  DefaultConnector,
} from '../connector';

import {
  context,
} from './types';

let storage: Storage | undefined  = undefined;
let connector = () => new DefaultConnector(storage);

beforeEach(() => {
  storage = undefined;
})

describe('DefaultConnector', () => {
  describe('#all', () => {
    let Klass: typeof NextModel;
    const subject = () => connector().all(Klass);

    context('with simple model', {
      definitions() {
        @Model
        class NewKlass extends NextModel {
          static get modelName(): string {
            return 'Foo';
          }
        };
        Klass = NewKlass;
      },
      tests() {
        test('returns empty array', () => {
          return expect(subject()).resolves.toEqual([]);
        });

        context('with single item prefilled storage', {
          definitions() {
            storage = {
              Foo: [
                { id: 1 },
              ],
            };

            @Model
            class NewKlass extends NextModel {
              static get modelName(): string {
                return 'Foo';
              }
            };
            Klass = NewKlass;
          },
          tests() {
            test('returns all items as model instances', () => {
              return expect(subject()).resolves.toEqual([
                new Klass({ id: 1 }),
              ]);
            });
          },
        });
    
        context('with multiple items prefilled storage', {
          definitions() {
            storage = {
              Foo: [
                { id: 1 },
                { id: 2 },
                { id: 3 },
              ],
            };
    
            @Model
            class NewKlass extends NextModel {
              static get modelName(): string {
                return 'Foo';
              }
            };
            Klass = NewKlass;
          },
          tests() {
            test('returns all items as model instances', () => {
              return expect(subject()).resolves.toEqual([
                new Klass({ id: 1 }),
                new Klass({ id: 2 }),
                new Klass({ id: 3 }),
              ]);
            });
    
            context('when query for first item property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 1,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                  ]);
                });
              },
            });

            context('when query for any item property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 2,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 2 }),
                  ]);
                });
              },
            });

            context('when query for non existing property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 4,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns empty array', () => {
                  return expect(subject()).resolves.toEqual([]);
                });
              },
            });

            context('when query is with single $not', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $not: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 2 }),
                    new Klass({ id: 3 }),
                  ]);
                });
              },
            });

            context('when query is with multiple $not', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $not: [
                        { id: 1 },
                        { id: 2 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 3 }),
                  ]);
                });
              },
            });

            context('when query is with single $and', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                  ]);
                });
              },
            });

            context('when query is with multiple $and', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        { id: 1 },
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                  ]);
                });
              },
            });

            context('when query is with single $or', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                  ]);
                });
              },
            });

            context('when query is with multiple $or', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                    new Klass({ id: 2 }),
                  ]);
                });
              },
            });

            context('when query is nested', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        {
                          $or: [
                            { id: 1 },
                            { id: 2 },
                          ],
                        },
                        {
                          $not: [
                            { id: 3 },
                          ],
                        },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                    new Klass({ id: 2 }),
                  ]);
                });
              },
            });

            context('when multiple special queries are in one layer', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                      $not: [
                        { id: 3 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                    new Klass({ id: 2 }),
                  ]);
                });
              },
            });

            context('when mixed normal and special queries are in one layer', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                      id: 1,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns all matching items as model instances', () => {
                  return expect(subject()).resolves.toEqual([
                    new Klass({ id: 1 }),
                  ]);
                });
              },
            });
          },
        });
      },
    });
  });

  describe('#first', () => {
    let Klass: typeof NextModel;
    const subject = () => connector().first(Klass);

    context('with simple model', {
      definitions() {
        @Model
        class NewKlass extends NextModel {
          static get modelName(): string {
            return 'Foo';
          }
        };
        Klass = NewKlass;
      },
      tests() {
        test('returns undefined', () => {
          return expect(subject()).resolves.toBeUndefined();
        });

        context('with single item prefilled storage', {
          definitions() {
            storage = {
              Foo: [
                { id: 1 },
              ],
            };
    
            @Model
            class NewKlass extends NextModel {
              static get modelName(): string {
                return 'Foo';
              }
            };
            Klass = NewKlass;
          },
          tests() {
            test('returns all items as model instances', () => {
              return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
            });
          },
        });
    
        context('with multiple items prefilled storage', {
          definitions() {
            storage = {
              Foo: [
                { id: 1 },
                { id: 2 },
                { id: 3 },
              ],
            };
    
            @Model
            class NewKlass extends NextModel {
              static get modelName(): string {
                return 'Foo';
              }
            };
            Klass = NewKlass;
          },
          tests() {
            test('returns all items as model instances', () => {
              return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
            });

            context('when query for first item property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 1,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });

            context('when query for any item property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 2,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 2 }));
                });
              },
            });

            context('when query for non existing property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 4,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns undefined', () => {
                  return expect(subject()).resolves.toBeUndefined();
                });
              },
            });

            context('when query is with single $not', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $not: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 2 }));
                });
              },
            });

            context('when query is with multiple $not', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $not: [
                        { id: 1 },
                        { id: 2 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 3 }));
                });
              },
            });

            context('when query is with single $and', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });

            context('when query is with multiple $and', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        { id: 1 },
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });

            context('when query is with single $or', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });

            context('when query is with multiple $or', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });

            context('when query is nested', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        {
                          $or: [
                            { id: 1 },
                            { id: 2 },
                          ],
                        },
                        {
                          $not: [
                            { id: 3 },
                          ],
                        },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });

            context('when multiple special queries are in one layer', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                      $not: [
                        { id: 3 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });

            context('when mixed normal and special queries are in one layer', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                      id: 1,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns first matching item as model instances', () => {
                  return expect(subject()).resolves.toEqual(new Klass({ id: 1 }));
                });
              },
            });
          },
        });
      },
    });
  });

  describe('#count', () => {
    let Klass: typeof NextModel;
    const subject = () => connector().count(Klass);

    context('with simple model', {
      definitions() {
        @Model
        class NewKlass extends NextModel {
          static get modelName(): string {
            return 'Foo';
          }
        };
        Klass = NewKlass;
      },
      tests() {
        test('returns zero', () => {
          return expect(subject()).resolves.toEqual(0);
        });

        context('with single item prefilled storage', {
          definitions() {
            storage = {
              Foo: [
                { id: 1 },
              ],
            };
    
            @Model
            class NewKlass extends NextModel {
              static get modelName(): string {
                return 'Foo';
              }
            };
            Klass = NewKlass;
          },
          tests() {
            test('returns one', () => {
              return expect(subject()).resolves.toEqual(1);
            });
          },
        });
    
        context('with multiple items prefilled storage', {
          definitions() {
            storage = {
              Foo: [
                { id: 1 },
                { id: 2 },
                { id: 3 },
              ],
            };
    
            @Model
            class NewKlass extends NextModel {
              static get modelName(): string {
                return 'Foo';
              }
            };
            Klass = NewKlass;
          },
          tests() {
            test('returns total count', () => {
              return expect(subject()).resolves.toEqual(3);
            });
    
            context('when query for first item property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 1,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(1);
                });
              },
            });

            context('when query for any item property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 2,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(1);
                });
              },
            });

            context('when query for non existing property match', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      id: 4,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(0);
                });
              },
            });

            context('when query is with single $not', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $not: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(2);
                });
              },
            });

            context('when query is with multiple $not', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $not: [
                        { id: 1 },
                        { id: 2 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(1);
                });
              },
            });

            context('when query is with single $and', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(1);
                });
              },
            });

            context('when query is with multiple $and', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        { id: 1 },
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(1);
                });
              },
            });

            context('when query is with single $or', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(1);
                });
              },
            });

            context('when query is with multiple $or', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(2);
                });
              },
            });

            context('when query is nested', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $and: [
                        {
                          $or: [
                            { id: 1 },
                            { id: 2 },
                          ],
                        },
                        {
                          $not: [
                            { id: 3 },
                          ],
                        },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(2);
                });
              },
            });

            context('when multiple special queries are in one layer', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                      $not: [
                        { id: 3 },
                      ],
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(2);
                });
              },
            });

            context('when mixed normal and special queries are in one layer', {
              definitions() {
                @Model
                class NewKlass extends Klass {
                  static get query(): Query {
                    return {
                      $or: [
                        { id: 1 },
                        { id: 2 },
                      ],
                      id: 1,
                    };
                  }
                };
                Klass = NewKlass;
              },
              tests() {
                test('returns count of  all matching items', () => {
                  return expect(subject()).resolves.toEqual(1);
                });
              },
            });
          },
        });
      },
    });
  });

  describe('#reload', () => {
    pending('not yet implemented');
  });

  describe('#insert', () => {
    pending('not yet implemented');
  });

  describe('#update', () => {
    pending('not yet implemented');
  });

  describe('#delete', () => {
    pending('not yet implemented');
  });
});