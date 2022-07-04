import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SqsModule } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { SQS_complete_password_change_producer } from './producer.service';

@Module({
  imports: [
    SqsModule.registerAsync({
      useFactory: (config_service: ConfigService) => {
        //Data necesaria para conectarnos a sqs
        AWS.config.update({
          region: config_service.get('aws.credentials.region'),
          accessKeyId: config_service.get('aws.credentials.key'),
          secretAccessKey: config_service.get('aws.credentials.secret_key'),
        });
        return {
          consumers: [],
          producers: [
            //registramos la cola
            {
              name: config_service.get(
                'aws.sqs.queues.complete_password_change.name',
              ),
              queueUrl: config_service.get(
                'aws.sqs.queues.complete_password_change.url',
              ),
              region: config_service.get('aws.credentials.region'),
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [SQS_complete_password_change_producer],
  exports: [SQS_complete_password_change_producer],
})
export class SQS_complete_password_change_module {}
