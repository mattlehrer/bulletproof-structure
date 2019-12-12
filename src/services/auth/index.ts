import { Service, Inject } from 'typedi';
import { generateToken } from './generateToken';
import { getSaltAndHashPassword, verify } from './hashPassword';
import { IUser, IUserInputDTO } from '../../interfaces/IUser';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '../../decorators/eventDispatcher';
import events from '../../subscribers/events';

@Service()
export default class AuthService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    // private mailer: MailerService,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async SignUp(
    userInputDTO: IUserInputDTO,
  ): Promise<{ user: IUser; token: string }> {
    try {
      // const salt = randomBytes(32);
      // this.logger.silly('Hashing password');
      const { salt, hashedPassword } = await getSaltAndHashPassword(
        userInputDTO.password,
      );
      this.logger.silly('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        salt: salt.toString('hex'),
        password: hashedPassword,
      });
      this.logger.silly('Generating JWT');
      const token = generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }

      this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

      /**
       * @TODO This is not the best way to deal with this
       * There should exist a 'Mapper' layer
       * that transforms data from layer to layer
       * but that's too over-engineering for now
       */
      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async SignIn(
    email: string,
    password: string,
  ): Promise<{ user: IUser; token: string }> {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      throw new Error('User not registered');
    }
    this.logger.silly('Checking password');
    const validPassword = await verify(userRecord.password, password);
    if (validPassword) {
      this.logger.silly('Password is valid!');
      this.logger.silly('Generating JWT');
      const token = generateToken(userRecord);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      this.eventDispatcher.dispatch(events.user.signIn, userRecord);
      return { user, token };
    } else {
      throw new Error('Invalid Password');
    }
  }
}
