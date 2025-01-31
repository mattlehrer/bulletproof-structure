import { Container } from 'typedi';
import MailerService from '../services/mailer';
import { LoggerInterface } from '../interfaces/LoggerInterface';

export default class EmailSequenceJob {
  public async handler(job, done): Promise<void> {
    const Logger: LoggerInterface = Container.get('logger');
    try {
      Logger.debug('✌️ Email Sequence Job triggered!');
      const { email, name }: { [key: string]: string } = job.attrs.data;
      const mailerServiceInstance = Container.get(MailerService);
      await mailerServiceInstance.SendWelcomeEmail(email);
      done();
    } catch (e) {
      Logger.error('🔥 Error with Email Sequence Job: %o', e);
      done(e);
    }
  }
}
