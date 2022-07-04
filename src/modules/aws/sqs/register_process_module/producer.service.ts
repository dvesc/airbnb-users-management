import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from '@ssut/nestjs-sqs';

@Injectable()
export class SQS_register_process_producer {
  //CONSTRUCTOR----------------------------------------------------------------
  constructor(
    private readonly config_service: ConfigService,
    private readonly sqsService: SqsService,
  ) {}

  //METHODS--------------------------------------------------------------------
  async send_message(email: string, process_code: string) {
    await this.sqsService.send(
      this.config_service.get('aws.sqs.queues.register_process.name'),
      {
        //necesita estos valores asi tal cual
        id: 'id',

        delaySeconds: 0,
        //nuestro mensaje
        body: {
          email,
          subject: 'Confirm your email address',
          html:
            '<b>click on the following link:</b>' +
            '<a href="">Continue with your check-account</a>' +
            '<b> and use this secret code: ' +
            process_code +
            '</b>',
        },
      },
    );
  }
}
