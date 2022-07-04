import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Injectable()
export class SQS_new_email_process_producer {
  //CONSTRUCTOR----------------------------------------------------------------
  constructor(
    private readonly config_service: ConfigService,
    private readonly sqsService: SqsService,
  ) {}

  //METHODS--------------------------------------------------------------------
  async send_message(email: string, process_code: string) {
    console.log(
      this.config_service.get('aws.sqs.queues.new_email_process.name'),
    );
    await this.sqsService.send(
      this.config_service.get('aws.sqs.queues.new_email_process.name'),
      {
        //necesita estos valores asi tal cual
        id: 'id',
        delaySeconds: 0,
        //nuestro mensaje
        body: {
          email,
          subject: 'Confirm your new email address',
          html:
            '<b>click on the following link:</b>' +
            '<a href="">to check your new email</a>' +
            '<b> and use this secret code: ' +
            process_code +
            '</b>',
        },
      },
    );
  }
}
