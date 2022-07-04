import { Module } from '@nestjs/common';
import { Auth0_service } from './auth0.service';

@Module({
  controllers: [],
  providers: [Auth0_service],
  exports: [Auth0_service],
})
export class Auth0_module {}
