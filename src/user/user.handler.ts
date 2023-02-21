import dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { UserService } from './user.service';
dotenv.config();

// Must be access from .env rather than ConfigService as it will
// not be initialised by the time the decorators have been registered
const USER_QUEUE_NAME = process.env.SQS_USERS_QUEUE_NAME!;

@Injectable()
export class UserHandler {
  constructor(private userService: UserService) {}

  @SqsMessageHandler(USER_QUEUE_NAME, false)
  public async handleMessage(message: AWS.SQS.Message) {
    try {
      if (!message.MessageAttributes) throw new Error('Missing attributes');

      const {
        UserId: id,
        Email: email,
        Nome: nome,
        Cognome: cognome,
        Telefono: telefono,
      } = message.MessageAttributes;

      if (!id.StringValue) throw new Error('Missing attribute: id');
      if (!email.StringValue) throw new Error('Missing attribute: email');
      if (!nome.StringValue) throw new Error('Missing attribute: nome');
      if (!cognome.StringValue) throw new Error('Missing attribute: cognome');

      return this.userService.register({
        id: id.StringValue,
        email: email.StringValue,
        nome: nome.StringValue,
        cognome: cognome.StringValue,
        telefono: telefono.StringValue,
      });
    } catch (err) {
      console.log(err);
    }
  }

  @SqsConsumerEventHandler(USER_QUEUE_NAME, 'processing_error')
  public onProcessingError(error: Error, message: AWS.SQS.Message) {
    // report errors here
    console.error(error);
    console.error(message);
  }
}
