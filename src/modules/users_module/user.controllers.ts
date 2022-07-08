import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UseGuards,
  Param,
  UsePipes,
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { phone as phone_lib } from 'phone';
import { UsersModuleService } from './users.service';
import {
  CreateUsersModuleDto,
  phone_number_property_dto,
  profile_pic_property_dto,
} from './dto/create_users_dto';
import { Request } from 'express';
import { Update_users_dto } from './dto/update_users_dto';
import { Registration_process_dto } from './dto/registration_process_dto';
import { Registration_process_vo } from './entities/in-registration-process.entity';
import { SQS_register_process_producer } from 'src/modules/aws/sqs/register_process_module/producer.service';
import { SQS_complete_user_registration_producer } from 'src/modules/aws/sqs/complete_user_registration_module/producer.service';
import { S3_profile_pic_services } from 'src/modules/aws/s3/profile_pic/s3_profile_pic.service';
import { from_base64_to } from 'src/common/files/from_base64_to';
import { Auth0_service } from '../auth0_module/auth0.service';
import { Users_vo } from './entities/users_module.entity';
import { Registration_process_service } from './registration_process.service';
import { Phone_numbers_service } from './phone_numbers.service';
import { Change_password_dto } from './dto/change_password_dto';
import { New_password_process_service } from './new_password_process.service';
import { New_password_process_vo } from './entities/new_password_process.entiy';
import { SQS_new_password_process_producer } from '../aws/sqs/new_password_process_module/producer.service';
import { New_password_dto } from './dto/new_password_dto';
import { SQS_complete_password_change_producer } from '../aws/sqs/complete_password_change/producer.service';
import { paginated_data } from 'src/common/pagination';
import { usersModuleGuard } from './users.guard';
import { Auth0_token_guard } from 'src/common/auth/auth0_token.guard';
import { Nonexistent_user_exception } from 'src/errors/nonexistent_use_exception';
import { Existent_user_exception } from 'src/errors/existent_user_exception';
import { Process_code_exception } from 'src/errors/process_code_exception';
import { New_email_process_vo } from './entities/new_email_process.entity';
import { New_email_process_service } from './new_email_process.service';
import { SQS_new_email_process_producer } from '../aws/sqs/new_email_process_module/producer.service';
import { Change_email_dto } from './dto/new_email_dto';
import { SQS_complete_email_change_producer } from '../aws/sqs/complete_email_change/producer.service';
import { Phone_numbers_vo } from './entities/phone_numbers.entity';
import { Invalid_phone_exception } from 'src/errors/invalid_phone_exception';
import { Exceeds_the_date_range_exception } from 'src/errors/exceeds_the_date_range_exception';

@Controller('users')
export class User_controllers {
  constructor(
    private readonly queue_register_process: SQS_register_process_producer,
    private readonly complete_password_change_queue: SQS_complete_password_change_producer,
    private readonly complete_email_change_queue: SQS_complete_email_change_producer,
    private readonly complete_user_registration_queue: SQS_complete_user_registration_producer,
    private readonly new_password_queue: SQS_new_password_process_producer,
    private readonly new_email_queue: SQS_new_email_process_producer,
    private readonly usersModuleService: UsersModuleService,
    private readonly phone_numbers_service: Phone_numbers_service,
    private readonly registration_process_service: Registration_process_service,
    private readonly new_password_process_service: New_password_process_service,
    private readonly new_email_process_service: New_email_process_service,
    private readonly profile_pic_bucket: S3_profile_pic_services,
    private readonly auth0: Auth0_service,
  ) {}

  //ENDPOINTS--------------------------------------------------------------------

  //REGISTRO DE EMAIL VALIDO-----------------------------------------------------
  @Post('singup')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async registration_step_1(
    @Body() body: Registration_process_dto,
  ): Promise<object> {
    //Conprobamos que el usuario no exita para poder pues crear uno
    const coincidence: Users_vo =
      await this.usersModuleService.get_user_by_email(body.email);

    if (!coincidence) {
      //generamos el codigo de 6 digitos
      const process_code = Math.random().toString(36).slice(-6);

      //guardamos en nuestra db
      const process_vo: Registration_process_vo =
        await this.registration_process_service.create_process_code(
          body.email,
          process_code,
        );

      //enviamos email
      this.queue_register_process.send_message(body.email, process_code);

      return {
        message:
          'we have sent you an email to that addresse with a ' +
          'code, please check out to continue',
        data: process_vo,
      };
    } else throw new Existent_user_exception();
  }

  //CONFIRMACION DE EMAIL Y CREACION DE PERFIL-----------------------------------
  @Post('/check-account')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async registration_step_2(
    @Body() body: CreateUsersModuleDto,
    @Query() query_params,
  ): Promise<object> {
    const { password, notifications } = body,
      first_name: string = body.first_name.toLocaleLowerCase(),
      last_name: string = body.last_name.toLocaleLowerCase(),
      phone_number: phone_number_property_dto =
        body.phone_number as phone_number_property_dto,
      profile_pic: profile_pic_property_dto =
        body.profile_pic as profile_pic_property_dto,
      { process_code } = query_params,
      full_name = first_name + ' ' + last_name,
      date_of_birth = body.date_of_birth;
    let profile_pic_uploaded: any;

    //consultamos en nuestra db si ya se consumio ese codigo
    const process: Registration_process_vo | undefined =
      await this.registration_process_service.get_registration_process_by_code(
        process_code,
      );

    if (process) {
      const email: string = process.email;

      //validamos que la fecha se encuentre en un rango valido minimo 18 maximo 100
      const birth = new Date(date_of_birth.split('-').reverse().join(',')),
        lapse = Math.floor(
          (new Date().getTime() - birth.getTime()) / (31536600 * 1000),
        );
      if (lapse < 18 || lapse > 100)
        throw new Exceeds_the_date_range_exception();

      //validamos el telefono
      const country_code: string = phone_number.country_code,
        number: string = phone_number.number.toString();
      const formatted_phone = phone_lib(country_code + number);
      if (!formatted_phone.isValid) throw new Invalid_phone_exception();

      //registramos ese usuario en auth0
      const auth0_id = await this.auth0.register_user(
        full_name,
        email,
        password,
      );

      //Si nos pasan la imagen
      if (profile_pic !== undefined && profile_pic instanceof Object) {
        if (profile_pic.hasOwnProperty('file')) {
          //Convertimos  de base64 a un archivo
          const file_data: object | undefined = from_base64_to(
            auth0_id,
            profile_pic.file,
          );

          //Subimos al bucket de s3
          profile_pic_uploaded = await this.profile_pic_bucket.upload_to_bucket(
            file_data,
          );
        }
      }

      //guardamos en nuestra db el usuario
      const new_user = {
          auth0_id,
          email,
          profile: {
            profile_pic: profile_pic_uploaded ? profile_pic_uploaded.Key : null,
            first_name,
            last_name,
            date_of_birth,
          },
          notifications,
        },
        created_user: Users_vo = await this.usersModuleService.create_user(
          new_user,
        );

      //guardamos su movil en la coleccion de telefonos
      const its_phone_number = {
          user_id: created_user._id,
          number: phone_number.number,
          country_code: formatted_phone.countryCode,
        },
        created_phone: Phone_numbers_vo =
          await this.phone_numbers_service.create_phone_number(
            its_phone_number,
          );

      //le añadimos ese telefono a la propiedad de phone_numbers en la coleccion de users
      await this.usersModuleService.update_phone_number_ids(
        created_user._id,
        created_phone._id,
      );

      //volvemos a consultar pero ya con toda la data
      const all_user_data = await this.usersModuleService.get_user_by_id(
        created_user._id,
      );

      //firmamos la imagen del bucket si la posee
      if (all_user_data.profile.profile_pic) {
        all_user_data.profile.profile_pic =
          await this.profile_pic_bucket.get_signed_url(
            all_user_data.profile.profile_pic,
          );
      }

      //enviamos email de bienvenida
      this.complete_user_registration_queue.send_message(email);

      //desavilitamos el codigo de proceso
      await this.registration_process_service.consume_registration_process(
        process._id,
      );

      return {
        message: 'the user has been created successfully',
        data: all_user_data,
      };
    } else throw new Process_code_exception();
  }

  //PETICION PARA CAMBIAR LA CONTRASEÑA----------------------------------------
  @Post('/change-password')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async change_password_step_1(@Body() body: Change_password_dto) {
    //comprobamos que el usuario existe
    const coincidence: Users_vo =
      await this.usersModuleService.get_user_by_email(body.email);

    if (coincidence) {
      //generamos el codigo de 6 digitos
      const process_code = Math.random().toString(36).slice(-6);

      //guardamos en nuestra db
      const process_vo: New_password_process_vo =
        await this.new_password_process_service.create_process_code(
          body.email,
          process_code,
        );

      //enviamos email
      this.new_password_queue.send_message(body.email, process_code);

      return {
        message:
          'we have sent you an email to that addresse with a ' +
          'code, please check out to continue',
        data: process_vo,
      };
    } else throw new Nonexistent_user_exception();
  }

  //PETICION PARA CAMBIAR EMAIL------------------------------------------------
  @UseGuards(Auth0_token_guard, usersModuleGuard)
  @Post(':user_id/change-email')
  @UsePipes(new ValidationPipe())
  async change_email_step_1(@Param() params, @Body() body: Change_email_dto) {
    const user_id = params.user_id,
      new_email = body.new_email,
      coincidence: Users_vo = await this.usersModuleService.get_user_by_id(
        user_id,
      );

    //comprobamos que el usuario existe
    if (coincidence) {
      //generamos el codigo de 6 digitos
      const process_code = Math.random().toString(36).slice(-6);

      //guardamos en nuestra db
      const process_vo: New_email_process_vo =
        await this.new_email_process_service.create_process_code(
          user_id,
          new_email,
          process_code,
        );

      //enviamos email
      this.new_email_queue.send_message(body.new_email, process_code);

      return {
        message:
          'we have sent you an email to that addresse with a ' +
          'code, please check out to continue',
        data: process_vo,
      };
    } else throw new Nonexistent_user_exception();
  }

  //CAMBIO DE CONTRASEÑA-------------------------------------------------------
  @Put('/new-password')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async change_password_step_2(
    @Body() body: New_password_dto,
    @Query() query_params,
  ): Promise<object> {
    const { password } = body,
      { process_code } = query_params;

    //consultamos en nuestra db si ya se consumio ese codigo
    const process: New_password_process_vo | undefined =
      await this.new_password_process_service.get_password_process_by_code(
        process_code,
      );

    if (process) {
      const email: string = process.email;
      //desavilitamos el codigo de proceso
      await this.new_password_process_service.consume_password_process(
        process._id,
      );

      //obtenemos el id de este usuario
      const user: Users_vo = await this.usersModuleService.get_user_by_email(
        email,
      );
      //actualizamos la contraseña en auth0
      await this.auth0.update_user(user.auth0_id, {
        password,
      });

      //enviamos email de operacion exitosa
      this.complete_password_change_queue.send_message(email);

      return {
        message: 'the password has been uploaded successfully',
      };
    } else throw new Process_code_exception();
  }

  //CONFIRMACION DEL NUEVO EMAIL-----------------------------------------------
  @Put('/new-email')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async change_email_step_2(@Query() query_params): Promise<object> {
    const { process_code } = query_params;

    //consultamos en nuestra db si ya se consumio ese codigo
    const process: New_email_process_vo | undefined =
      await this.new_email_process_service.get_email_process_by_code(
        process_code,
      );

    if (process) {
      const new_email: string = process.new_email;
      //desavilitamos el codigo de proceso
      await this.new_email_process_service.consume_email_process(process._id);

      //obtenemos el id de este usuario
      const user: Users_vo = await this.usersModuleService.get_user_by_id(
        process.user_id,
      );

      //actualizamos el email en auth0
      await this.auth0.update_user(user.auth0_id, {
        email: new_email,
      });

      //actualizamos el email en nuestra db
      this.usersModuleService.update(user._id, {
        email: new_email,
      });

      //enviamos email de operacion exitosa
      this.complete_email_change_queue.send_message(new_email);

      return {
        message: 'the email has been uploaded successfully',
      };
    } else throw new Process_code_exception();
  }
  //OBTENER USUARIOS-----------------------------------------------------------
  @Get()
  @HttpCode(HttpStatus.OK)
  async get_users(
    @Req()
    req: Request,
    @Query()
    query_params,
  ) {
    let coincidences = null;
    //Asignamos valores predeterminados
    const filter_by: string = query_params.filterby || 'all',
      filter_value: string = query_params.filtervalue || '',
      order: number = query_params.order == 'desc' ? -1 : 1, //asc deafult
      page: number = query_params.page || 1,
      size: number = query_params.size || 10;

    //manipulamos la posible data de orderby
    let order_by: string;
    if (query_params.orderby)
      order_by = query_params.orderby.match(
        /id|email|role|first_name|last_name/i,
      )
        ? query_params.orderby
        : 'created_at';
    else order_by = 'created_at';
    if (order_by.match(/first_name|last_name/i))
      order_by = 'profile.' + order_by; //ya que son propiedades dentro de otra

    //debe ser "<order by>:<1||-1>"
    const sort = {
      [`${order_by}`]: order,
    } as Record<string, 1 | -1 | { $meta: 'textScore' }>; //esto fue por un error

    console.log(sort);
    switch (filter_by) {
      default:
        coincidences = await this.usersModuleService.coincidences_by_all(
          filter_value,
          sort,
        );
        break;
      case 'id':
        coincidences = await this.usersModuleService.coincidences_by_id(
          filter_value,
          sort,
        );
        break;
      case 'email':
        coincidences = await this.usersModuleService.coincidences_by_email(
          filter_value,
          sort,
        );
        break;

      case 'role':
        coincidences = await this.usersModuleService.coincidences_by_role(
          filter_value,
          sort,
        );
        break;

      case 'first_name':
        coincidences = await this.usersModuleService.coincidences_by_first_name(
          filter_value,
          sort,
        );
        break;

      case 'last_name':
        coincidences = await this.usersModuleService.coincidences_by_last_name(
          filter_value,
          sort,
        );
        break;

      case 'gender':
        coincidences = await this.usersModuleService.coincidences_by_gender(
          filter_value,
          sort,
        );
        break;
    }

    //generamos la url firmada por cada usuario obtenido si posee una img
    for (let i = 0; i < coincidences.length; i++) {
      if (coincidences[i].profile.profile_pic) {
        coincidences[i].profile.profile_pic =
          await this.profile_pic_bucket.get_signed_url(
            coincidences[i].profile.profile_pic,
          );
      }
    }

    return paginated_data(page, size, coincidences, req);
  }

  //ACTUALIZAR UN USUARIO------------------------------------------------------
  @UseGuards(Auth0_token_guard, usersModuleGuard)
  @Put(':user_id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async update(@Param() params, @Body() update_user_dto: Update_users_dto) {
    const body = update_user_dto as any,
      first_name: string | undefined = body.first_name
        ? body.first_name.toLocaleLowerCase()
        : undefined,
      last_name: string | undefined = body.last_name
        ? body.last_name.toLocaleLowerCase()
        : undefined,
      user_id: string = params.user_id,
      date_of_birth = update_user_dto.date_of_birth;
    let profile_pic_uploaded, file_key, full_name;

    //buscamos al usuario
    console.log('el users_id' + user_id);
    const coincidence: Users_vo = await this.usersModuleService.get_user_by_id(
      user_id,
    );

    //Comprobamos que exista dicho usuario
    if (!coincidence) throw new Nonexistent_user_exception();

    //validamos que la fecha se encuentre en un rango valido minimo 18 maximo 100
    if (date_of_birth) {
      const birth = new Date(date_of_birth.split('-').reverse().join(',')),
        lapse = Math.floor(
          (new Date().getTime() - birth.getTime()) / (31536600 * 1000),
        );
      if (lapse < 18 || lapse > 100)
        throw new Exceeds_the_date_range_exception();
    }

    //si nos pasan una nueva imagen actualizamos en el s3 . . . . . . . . . . .
    if (body.profile_pic !== undefined && body.profile_pic instanceof Object) {
      if (body.profile_pic.hasOwnProperty('file')) {
        const profile_pic: profile_pic_property_dto =
          body.profile_pic as profile_pic_property_dto;
        //la convertimos de base a 64 a archivo
        const file_data: object | undefined = from_base64_to(
          coincidence.auth0_id,
          profile_pic.file,
        );
        //Subimos al bucket de s3 el nuevo archivo
        profile_pic_uploaded = await this.profile_pic_bucket.upload_to_bucket(
          file_data,
        );

        if (profile_pic_uploaded) {
          //obtenemos su nombre
          file_key = profile_pic_uploaded.Key;
          //y eliminamos el viejo
          await this.profile_pic_bucket.delete_file(
            coincidence.profile.profile_pic,
          );
        }
      }
    }

    //actualizar usuario en auth0 si hace falta . . . . . . . . . . . . . . .
    if (first_name || last_name) {
      //en este caso el nombre
      full_name = `${first_name || coincidence.profile.first_name} ${
        last_name || coincidence.profile.last_name
      }`;
      this.auth0.update_user(coincidence.auth0_id, { name: full_name });
    }

    //actualizamos la commodity en nuestra db . . . . . . . . . . . . . . . . .
    const new_data = {
      notifications: body.notification,
      'profile.first_name': first_name,
      'profile.last_name': last_name,
      'profile.profile_pic': file_key,
      'profile.gender': body.gender,
      'profile.date_of_birth': body.date_of_birth,
      updated_at: Date(),
    };
    await this.usersModuleService.update(user_id, new_data);

    return {
      message: 'The user has been updated succesfully',
    };
  }

  //ELIMINAR UN USUARIO------------------------------------------------------------------
  @UseGuards(Auth0_token_guard, usersModuleGuard)
  @Delete(':user_id')
  @HttpCode(HttpStatus.OK)
  async remove_user(@Param() params) {
    const user_id: string = params.user_id;
    //buscamos el usuario a eliminar
    const coincidence: Users_vo = await this.usersModuleService.get_user_by_id(
      user_id,
    );
    //Comprobamos que exista dicho usuario
    if (!coincidence) throw new Nonexistent_user_exception();

    //ELiminamos al usuario de nuestra db
    await this.usersModuleService.remove(user_id);

    //Eliminamos al usuario de auth0
    await this.auth0.delete_user(coincidence.auth0_id);

    //eliminamos la imagen del bucket de s3
    await this.profile_pic_bucket.delete_file(coincidence.profile.profile_pic);
    return {
      message: 'The user has been deleted succesfully',
    };
  }
}
