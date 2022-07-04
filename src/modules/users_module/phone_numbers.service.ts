import { Inject, Injectable, Type } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Users, Users_vo } from './entities/users_module.entity';
import {
  Phone_numbers,
  Phone_numbers_vo,
} from './entities/phone_numbers.entity';

@Injectable()
export class Phone_numbers_service {
  //CONSTRUCTOR CON INYECCIONES------------------------------------------------
  constructor(
    @InjectModel(Users.name)
    private users_model: Model<Users_vo>,
    @InjectModel(Phone_numbers.name)
    private phone_numbers_model: Model<Phone_numbers_vo>,
  ) {}

  //METHODS--------------------------------------------------------------------
  async create_phone_number(data: any): Promise<Phone_numbers_vo> {
    const phone_number_vo = new this.phone_numbers_model(data);
    //guardamos en la db
    const new_phone_number: Phone_numbers_vo = await phone_number_vo.save();
    return new_phone_number;
  }
}
