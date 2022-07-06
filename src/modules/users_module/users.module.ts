import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModuleService } from './users.service';
import { User_controllers } from './user.controllers';
import { users_schema, Users } from './entities/users_module.entity';
import {
  Registration_process,
  registration_process_schema,
} from './entities/in-registration-process.entity';
import { SQS_register_process_module } from 'src/modules/aws/sqs/register_process_module/register_process.module';
import { S3_profile_pic_module } from 'src/modules/aws/s3/profile_pic/s3_profile_pic.module';
import { Auth0_module } from '../auth0_module/auth0.module';
import { SQS_complete_user_registration_module } from '../aws/sqs/complete_user_registration_module/complete_user_registration.module';
import { Registration_process_service } from './registration_process.service';
import {
  Phone_numbers,
  phone_numbers_schema,
} from './entities/phone_numbers.entity';
import { Phone_numbers_service } from './phone_numbers.service';
import {
  New_password_process,
  new_password_process_schema,
} from './entities/new_password_process.entiy';
import { SQS_new_password_process_module } from '../aws/sqs/new_password_process_module/new_password_process.module';
import { New_password_process_service } from './new_password_process.service';
import { SQS_complete_password_change_module } from '../aws/sqs/complete_password_change/complete_password_change.module';
import { SQS_new_email_process_module } from '../aws/sqs/new_email_process_module/new_email_process.module';
import {
  New_email_process,
  new_email_process_schema,
} from './entities/new_email_process.entity';
import { New_email_process_service } from './new_email_process.service';
import { SQS_complete_email_change_module } from '../aws/sqs/complete_email_change/complete_email_change.module';

@Module({
  //importamos el modulo de mongo a este modulo
  imports: [
    Auth0_module,
    SQS_register_process_module,
    SQS_new_email_process_module,
    SQS_complete_user_registration_module,
    SQS_new_password_process_module,
    SQS_complete_password_change_module,
    SQS_complete_email_change_module,
    S3_profile_pic_module,
    //para que carguen los schemas de las colecciones de nuestro modulo a la db
    MongooseModule.forFeature([
      //ojo con el orden ya que Users necesita que phone_numbers exista
      { name: New_password_process.name, schema: new_password_process_schema },
      { name: New_email_process.name, schema: new_email_process_schema },
      { name: Registration_process.name, schema: registration_process_schema },
      { name: Phone_numbers.name, schema: phone_numbers_schema },
      { name: Users.name, schema: users_schema },
    ]),
  ],
  controllers: [User_controllers],
  providers: [
    UsersModuleService,
    Registration_process_service,
    New_email_process_service,
    New_password_process_service,
    Phone_numbers_service,
  ],
})
export class UsersModuleModule {}
