import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { SQS_new_password_process_producer } from './producer.service';
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
              name: config_service.get('aws.sqs.queues.password_process.name'),
              queueUrl: config_service.get(
                'aws.sqs.queues.password_process.url',
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
  providers: [SQS_new_password_process_producer],
  exports: [SQS_new_password_process_producer],
})
export class SQS_new_password_process_module {}
