import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { ConfigService } from '@nestjs/config';
import { generate_complete_password_change_html } from './html_message';
@Injectable()
export class SQS_complete_password_change_producer {
  //CONSTRUCTOR----------------------------------------------------------------
  constructor(
    private readonly sqsService: SqsService,
    private readonly config_service: ConfigService,
  ) {}

  //METHODS--------------------------------------------------------------------
  async send_message(email: string) {
    await this.sqsService.send(
      this.config_service.get('aws.sqs.queues.complete_password_change.name'),
      {
        id: 'id', //no preguntes pero asi funciona :v
        //esto es lo que importa, este seria el msg que realmente manda
        body: {
          email,
          subject: 'The password has been changed',
          html: generate_complete_password_change_html(),
        },
        delaySeconds: 0,
      },
    );
  }
}
