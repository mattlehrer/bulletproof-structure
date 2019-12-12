import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { Container } from 'typedi';
import { LoggerInterface } from '../../interfaces/LoggerInterface';

export const getSaltAndHashPassword = async password => {
  const salt = randomBytes(32);
  const logger: LoggerInterface = Container.get('logger');
  logger.silly('Hashing password');
  return {
    salt,
    hashedPassword: await argon2.hash(password, { salt }),
  };
};

export const verify = async (actual, attempt) => {
  return await argon2.verify(actual, attempt);
};
