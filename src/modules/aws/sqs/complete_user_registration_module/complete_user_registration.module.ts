import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SQS_complete_user_registration_producer } from './producer.service';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

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
                'aws.sqs.queues.complete_user_registration.name',
              ),
              queueUrl: config_service.get(
                'aws.sqs.queues.complete_user_registration.url',
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
  providers: [SQS_complete_user_registration_producer],
  exports: [SQS_complete_user_registration_producer],
})
export class SQS_complete_user_registration_module {}
