import { models, model, Schema, SchemaType, SchemaTypeOpts, Types } from 'mongoose';
import { IUser, UserLang, UserRole } from '../types';

type definitionType = (collection: string) => Record<keyof Required<IUser>, SchemaTypeOpts<any> | Schema | SchemaType>;

const definition: definitionType = (collection: string) => ({
  _id: Types.ObjectId,
  login: {
    type: String,
    max: 50,
    unique: true,
    required: true,
    index: true
  },
  password: {
    type: String,
    max: 100,
    required: true
  },
  roles: {
    type: [String],
    enum: Object.values(UserRole),
    required: true,
    default: [UserRole.USER.toString()]
  },
  firstName: {
    type: String,
    max: 50,
    required: true,
    index: true
  },
  lastName: {
    type: String,
    max: 50,
    required: false
  },
  email: {
    type: String,
    max: 100,
    required: true,
    unique: true,
    index: true
  },
  activated: {
    type: Boolean,
    default: false
  },
  langKey: {
    type: String,
    enum: Object.values(UserLang),
    default: 'es'
  },
  createdBy: {
    type: Types.ObjectId,
    ref: collection,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: Types.ObjectId,
    ref: collection,
    required: false
  },
  lastModifiedDate: {
    type: Date
  }
});

export const userMongoModel = (collection: string) => {
  const schema = new Schema<IUser>(definition(collection), { autoIndex: true });
  return models[collection] || model(collection, schema);
};