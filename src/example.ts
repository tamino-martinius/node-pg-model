import {
  column,
  Model,
} from '.';

interface UserSchema {
  id: number | undefined;
  firstName: string;
  lastName: string;
}

class User extends Model implements UserSchema {
  @column()
  id: number;

  @column()
  firstName: string;

  @column()
  lastName: string;

  static tableName = 'User';

  get addresses() {
    return Address.queryBy().userId(this.id);
  }

  constructor(attrs: UserSchema) {
    super(attrs);
  }
}

interface AddressSchema {
  id: number;
  userId: number;
  street: string;
  city: string;
}

class Address extends Model implements AddressSchema {
  @column()
  id: number;

  @column()
  userId: number;

  @column()
  street: string;

  @column()
  city: string;

  static tableName = 'Addresss';

  constructor(attrs: AddressSchema) {
    super(attrs);
  }

  get user() {
    return User.findBy().id(this.userId);
  }
}

async () => {
  const address1 = await Address.first();
  const address2 = await Address.first();
  const user1 = address1 ? address1.user : undefined;
  const user2 = address2 ? address2.user : undefined;
  const addresses1 = Address.limitBy(12).filterBy({
    street: 'a',
  });
  const addresses1 = Address.filterBy({
    x: 'a', // invalid
  });
  const addresses2 = Address.filterBy({
    $async: Promise.resolve({
      street: 'a',
    }),
  });
  const addresses3 = Address.filterBy({
    $gt: { street: 'a' },
  });
  const addresses4 = Address.filterBy({
    $in: { street: ['a'] },
  });
};
