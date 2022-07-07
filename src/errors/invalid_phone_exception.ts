import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class Invalid_phone_exception extends My_exception {
  constructor() {
    super(
      'the number does not match the country code entered',
      'InvalidPhoneException ',
      HttpStatus.BAD_REQUEST,
    );
  }
}
