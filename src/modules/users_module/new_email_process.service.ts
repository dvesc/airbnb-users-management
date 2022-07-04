import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Users, Users_vo } from './entities/users_module.entity';
import {
  New_email_process,
  New_email_process_vo,
} from './entities/new_email_process.entity';

@Injectable()
export class New_email_process_service {
  //CONSTRUCTOR CON INYECCIONES------------------------------------------------
  constructor(
    @InjectModel(New_email_process.name)
    private new_email_process_model: Model<New_email_process_vo>,
    @InjectModel(Users.name)
    private users_model: Model<Users_vo>,
  ) {}

  //METHODS--------------------------------------------------------------------
  async create_process_code(
    user_id: string,
    new_email: string,
    process_code: string,
  ): Promise<New_email_process_vo> {
    //generamos el cuerpo del nuevo process_vo
    const email_process_vo = new this.new_email_process_model();
    email_process_vo.user_id = user_id;
    email_process_vo.new_email = new_email;
    email_process_vo.process_code = process_code;

    //guardamos en la db
    const new_email_process_vo: New_email_process_vo =
      await email_process_vo.save();
    return new_email_process_vo;
  }

  async get_email_process_by_id(
    id: string,
  ): Promise<undefined | New_email_process_vo> {
    const process: undefined | New_email_process_vo =
      await this.new_email_process_model.findOne({
        _id: new Types.ObjectId(id),
        status: 'generated',
      });
    return process;
  }

  async get_email_process_by_code(
    process_code: string,
  ): Promise<undefined | New_email_process_vo> {
    //buscamos si el process_code que nos pasaron no ha sido consumido
    const process: undefined | New_email_process_vo =
      await this.new_email_process_model.findOne({
        $and: [{ process_code: process_code }, { status: 'generated' }],
      });

    return process;
  }

  async consume_email_process(id: string) {
    const process: New_email_process_vo = await this.get_email_process_by_id(
      id,
    );

    await process.updateOne({ status: 'consumed' });
  }
}
