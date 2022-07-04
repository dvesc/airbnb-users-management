import { Inject, Injectable, Type } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUsersModuleDto } from './dto/create_users_dto';
import { Update_users_dto } from './dto/update_users_dto';
import {
  Registration_process,
  Registration_process_vo,
} from './entities/in-registration-process.entity';
import { Users, Users_vo } from './entities/users_module.entity';

@Injectable()
export class UsersModuleService {
  //CONSTRUCTOR CON INYECCIONES------------------------------------------------
  constructor(
    @InjectModel(Registration_process.name)
    private registration_process_model: Model<Registration_process_vo>,
    @InjectModel(Users.name)
    private users_model: Model<Users_vo>,
  ) {}

  //METHODS--------------------------------------------------------------------
  async create_user(data: any): Promise<Users_vo> {
    const user_vo = new this.users_model(data);
    //guardamos en la db
    const new_user: Users_vo = await user_vo.save();
    return new_user;
  }

  async get_user_by_id(id: string): Promise<undefined | Users_vo> {
    const coincidence: undefined | Users_vo = await this.users_model.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: null,
    });

    return coincidence;
  }

  async get_user_by_email(email: string): Promise<undefined | Users_vo> {
    const coincidence: undefined | Users_vo = await this.users_model.findOne({
      email: email,
      deleted_at: null,
    });

    return coincidence;
  }

  //COINCIDENCIAS POR TODO----------------------------------------------------
  async coincidences_by_all(
    filtervalue: string,
    sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
  ): Promise<Users_vo[]> {
    try {
      let coincidences: Users_vo[] = [];
      const reg_exp = new RegExp(`${filtervalue}`, 'i');

      //Creamos el filtro
      const terms: object[] = [{ name: reg_exp }, { user_id: filtervalue }],
        filter = { $and: [{ deleted_at: null }, { $or: terms }] };

      //Consultamos la db
      coincidences = await this.users_model.find(filter).sort(sort);

      return coincidences;
    } catch (err) {
      console.log('error: ' + err);
    }
  }

  //COINCIDENCIAS POR USER_ID--------------------------------------------------
  async coincidences_by_user_id(
    filtervalue: string,
    sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
  ): Promise<Users_vo[]> {
    try {
      let coincidences: Users_vo[] = [];
      const reg_exp = new RegExp(`${filtervalue}`, 'i');
      //Consultamos la db
      coincidences = await this.users_model
        .find({
          user_id: reg_exp,
          deleted_at: null,
        })
        .sort(sort);

      return coincidences;
    } catch (err) {
      //MANEJAR ERROR
    }
  }

  //COINCIDENCIAS POR EMAIL----------------------------------------------------
  async coincidences_by_email(
    filtervalue: string,
    sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
  ): Promise<Users_vo[]> {
    try {
      let coincidences: Users_vo[] = [];
      const reg_exp = new RegExp(`${filtervalue}`, 'i');
      //Consultamos la db
      coincidences = await this.users_model
        .find({
          email: reg_exp,
          deleted_at: null,
        })
        .sort(sort);

      return coincidences;
    } catch (err) {
      //MANEJAR ERROR
    }
  }

  //COINCIDENCIAS POR ROLE-----------------------------------------------------
  async coincidences_by_role(
    filtervalue: string,
    sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
  ): Promise<Users_vo[]> {
    try {
      let coincidences: Users_vo[] = [];
      const reg_exp = new RegExp(`${filtervalue}`, 'i');
      //Consultamos la db
      coincidences = await this.users_model
        .find({
          role: reg_exp,
          deleted_at: null,
        })
        .sort(sort);

      return coincidences;
    } catch (err) {
      //MANEJAR ERROR
    }
  }

  //COINCIDENCIAS POR GENDER-----------------------------------------------------
  async coincidences_by_gender(
    filtervalue: string,
    sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
  ): Promise<Users_vo[]> {
    try {
      let coincidences: Users_vo[] = [];
      const reg_exp = new RegExp(`${filtervalue}`, 'i');
      //Consultamos la db
      coincidences = await this.users_model
        .find({
          'profile.gender': reg_exp,
          deleted_at: null,
        })
        .sort(sort);

      return coincidences;
    } catch (err) {
      //MANEJAR ERROR
    }
  }

  //COINCIDENCIAS POR FIRST_NAME-----------------------------------------------------
  async coincidences_by_first_name(
    filtervalue: string,
    sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
  ): Promise<Users_vo[]> {
    try {
      let coincidences: Users_vo[] = [];
      const reg_exp = new RegExp(`${filtervalue}`, 'i');
      //Consultamos la db
      coincidences = await this.users_model
        .find({
          'profile.first_name': reg_exp,
          deleted_at: null,
        })
        .sort(sort);

      return coincidences;
    } catch (err) {
      //MANEJAR ERROR
    }
  }

  //COINCIDENCIAS POR LAST_NAME -----------------------------------------------------
  async coincidences_by_last_name(
    filtervalue: string,
    sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
  ): Promise<Users_vo[]> {
    try {
      let coincidences: Users_vo[] = [];
      const reg_exp = new RegExp(`${filtervalue}`, 'i');
      //Consultamos la db
      coincidences = await this.users_model
        .find({
          'profile.last_name': reg_exp,
          deleted_at: null,
        })
        .sort(sort);

      return coincidences;
    } catch (err) {
      //MANEJAR ERROR
    }
  }

  //No pongo el tipo de dato que retorna porque no muestra todas las propiedades
  async update(id: string, new_user_data: object) {
    //LLamamos al usuario original y actualizamos
    const old_user = await this.get_user_by_id(id);
    await old_user.update(new_user_data);
    return true;
  }

  async remove(id: string) {
    //LLamamos al user y actualizamos
    const coincidence: Users_vo = await this.get_user_by_id(id);

    await coincidence.update({
      deleted_at: Date(),
    });
  }
}