import {
  createBaseModel,
  Columns,
  Model,
  Instance,
} from '.';

interface UserSchema {
  id: number;
  firstName: string;
  lastName: string;
}

class User extends createBaseModel<UserSchema>() implements UserSchema {
  id: number;
  firstName: string;
  lastName: string;

  static tableName = 'User';
  static columns: Columns<UserSchema> = {
    id: { type: 'Serial' },
    firstName: { type: 'CharVarying' },
    lastName: { type: 'CharVarying' },
  };

  static get $(): Model<UserSchema, typeof User, User> {
    return <any>this.getTyped();
  }

  get $(): Instance<UserSchema, typeof User, User> {
    return <any>this.getTyped();
  }

  get addresses() {
    return Address.$.queryBy.userId(this.id);
  }
}

interface AddressSchema {
  id: number;
  userId: number;
  street: string;
  city: string;
}

class Address extends createBaseModel<AddressSchema>() implements AddressSchema {
  id: number;
  userId: number;
  street: string;
  city: string;

  static tableName = 'Addresss';

  static columns: Columns<AddressSchema> = {
    id: { type: 'Serial' },
    userId: { type: 'Integer' },
    city: { type: 'CharVarying' },
    street: { type: 'CharVarying' },
  };

  static get $(): Model<AddressSchema, typeof Address, Address> {
    return <any>this.getTyped();
  }

  get $(): Instance<AddressSchema, typeof Address, Address> {
    return <any>this.getTyped();
  }

  get user() {
    return User.$.findBy.id(this.userId);
  }
}

// async () => {
//   const address1 = await Address.first;
//   const address2 = await Address.$.first;
//   const user1 = address1 ? address1.user : undefined; // invalid
//   const user2 = address2 ? address2.user : undefined;
//   const addresses1 = Address.filterBy({
//     street: 'a',
//   });
//   const addresses1 = Address.filterBy({
//     x: 'a',
//   });
//   const addresses2 = Address.$.filterBy({
//     $async: Promise.resolve({
//       street: 'a',
//     }),
//   });
//   const addresses3 = Address.$.filterBy({
//     $gt: { street: 'a' },
//   });
//   const addresses4 = Address.$.filterBy({
//     $in: { street: ['a'] },
//   });
// };
