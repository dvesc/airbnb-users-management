import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Registration_process,
  Registration_process_vo,
} from './entities/in-registration-process.entity';
import { Users, Users_vo } from './entities/users_module.entity';

@Injectable()
export class Registration_process_service {
  //CONSTRUCTOR CON INYECCIONES------------------------------------------------
  constructor(
    @InjectModel(Registration_process.name)
    private registration_process_model: Model<Registration_process_vo>,
    @InjectModel(Users.name)
    private users_model: Model<Users_vo>,
  ) {}

  //METHODS--------------------------------------------------------------------
  async create_process_code(
    email: string,
    process_code: string,
  ): Promise<Registration_process_vo> {
    //generamos el cuerpo del nuevo process_vo
    const registration_process_vo = new this.registration_process_model();
    registration_process_vo.email = email;
    registration_process_vo.process_code = process_code;

    //guardamos en la db
    const new_registration_process_vo: Registration_process_vo =
      await registration_process_vo.save();
    return new_registration_process_vo;
  }

  async get_registration_process_by_id(
    id: string,
  ): Promise<undefined | Registration_process_vo> {
    console.log(id);
    const process: undefined | Registration_process_vo =
      await this.registration_process_model.findOne({
        _id: new Types.ObjectId(id),
        status: 'generated',
      });
    console.log(process);
    return process;
  }

  async get_registration_process_by_code(
    process_code: string,
  ): Promise<undefined | Registration_process_vo> {
    //buscamos si el process_code que nos pasaron no ha sido consumido
    const process: undefined | Registration_process_vo =
      await this.registration_process_model.findOne({
        $and: [{ process_code: process_code }, { status: 'generated' }],
      });

    return process;
  }

  async consume_registration_process(id: string) {
    const process: Registration_process_vo =
      await this.get_registration_process_by_id(id);

    await process.updateOne({ status: 'consumed' });
  }
}
