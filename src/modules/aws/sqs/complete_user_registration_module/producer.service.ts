import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { ConfigService } from '@nestjs/config';
import { generate_complete_user_registration_html } from './html_message';

@Injectable()
export class SQS_complete_user_registration_producer {
  //CONSTRUCTOR----------------------------------------------------------------
  constructor(
    private readonly config_service: ConfigService,
    private readonly sqsService: SqsService,
  ) {}

  //METHODS--------------------------------------------------------------------
  async send_message(email: string) {
    await this.sqsService.send(
      this.config_service.get('aws.sqs.queues.complete_user_registration.name'),
      {
        id: 'id', //no preguntes pero asi funciona :v
        //esto es lo que importa, este seria el msg que realmente manda
        body: {
          email,
          subject:
            'We welcome you to Airbnb! What will be your first destination?',
          html: generate_complete_user_registration_html(),
        },
        delaySeconds: 0,
      },
    );
  }
}
