import mongoose from 'mongoose';
import { Db } from 'mongodb';
import config from '../config';

export default async (): Promise<Db> => {
  interface NewConnectionOptions extends mongoose.ConnectionOptions {
    useUnifiedTopology?: boolean;
  }

  const connection = await mongoose.connect(config.databaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  } as NewConnectionOptions);
  return connection.connection.db;
};
