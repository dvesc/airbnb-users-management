import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from '@ssut/nestjs-sqs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Injectable()
export class SQS_new_password_process_producer {
  //CONSTRUCTOR----------------------------------------------------------------
  constructor(
    private readonly sqsService: SqsService,
    private readonly config_service: ConfigService,
  ) {}

  //METHODS--------------------------------------------------------------------
  async send_message(email: string, process_code: string) {
    await this.sqsService.send(
      this.config_service.get('aws.sqs.queues.password_process.name'),
      {
        id: 'id', //no preguntes pero asi funciona :v
        //esto es lo que importa, este seria el msg que realmente manda
        body: {
          email,
          subject: 'Confirm your email address',
          html:
            '<b>click on the following link:</b>' +
            '<a href="">Continue with your new password process </a>' +
            '<b> and use this secret code: ' +
            process_code +
            '</b>',
        },
        delaySeconds: 0,
      },
    );
  }
}
