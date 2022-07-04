import { Module } from '@nestjs/common';
import { S3_profile_pic_services } from './s3_profile_pic.service';

@Module({
  controllers: [],
  providers: [S3_profile_pic_services],
  exports: [S3_profile_pic_services],
})
export class S3_profile_pic_module {}
