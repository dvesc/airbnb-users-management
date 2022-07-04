import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Registration_process,
  Registration_process_vo,
} from './entities/in-registration-process.entity';
import { Users, Users_vo } from './entities/users_module.entity';
import {
  New_password_process,
  New_password_process_vo,
} from './entities/new_password_process.entiy';

@Injectable()
export class New_password_process_service {
  //CONSTRUCTOR CON INYECCIONES------------------------------------------------
  constructor(
    @InjectModel(New_password_process.name)
    private new_password_process_model: Model<New_password_process_vo>,
    @InjectModel(Users.name)
    private users_model: Model<Users_vo>,
  ) {}

  //METHODS--------------------------------------------------------------------
  async create_process_code(
    email: string,
    process_code: string,
  ): Promise<New_password_process_vo> {
    //generamos el cuerpo del nuevo process_vo
    const password_process_vo = new this.new_password_process_model();
    password_process_vo.email = email;
    password_process_vo.process_code = process_code;

    //guardamos en la db
    const new_password_process_vo: New_password_process_vo =
      await password_process_vo.save();
    return new_password_process_vo;
  }

  async get_password_process_by_id(
    id: string,
  ): Promise<undefined | New_password_process_vo> {
    const process: undefined | New_password_process_vo =
      await this.new_password_process_model.findOne({
        _id: new Types.ObjectId(id),
        status: 'generated',
      });
    return process;
  }

  async get_password_process_by_code(
    process_code: string,
  ): Promise<undefined | New_password_process_vo> {
    //buscamos si el process_code que nos pasaron no ha sido consumido
    const process: undefined | New_password_process_vo =
      await this.new_password_process_model.findOne({
        $and: [{ process_code: process_code }, { status: 'generated' }],
      });

    return process;
  }

  async consume_password_process(id: string) {
    const process: New_password_process_vo =
      await this.get_password_process_by_id(id);

    await process.updateOne({ status: 'consumed' });
  }
}
