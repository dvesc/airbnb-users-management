import { Module } from '@nestjs/common';
import mongo_config from './config/mongo_config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModuleModule } from './modules/users_module/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import aws_config from './config/aws_config';
import { SqsModule, SqsConfigOption, SqsConfig } from '@nestjs-packages/sqs';
import auth0_config from './config/auth0_config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config(); //es la vieja importacion de js y eslind se pone sencible

//-----------------------------------------------------------------------------
@Module({
  imports: [
    UsersModuleModule,
    ConfigModule.forRoot({
      //cargamos los diferentes obj de configuracion
      load: [mongo_config, aws_config, auth0_config],
      //carga las variables de acuerdo al entorno indicado
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true, //Activa las env para todos los modulos
    }),
    //Conexion con mongodb
    MongooseModule.forRootAsync({
      useFactory: async (config_service: ConfigService) => ({
        uri: config_service.get('mongo.uri'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
