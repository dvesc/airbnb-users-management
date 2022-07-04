import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class User_duplication_exception extends My_exception {
  constructor() {
    super(
      'It looks like you are trying to create a user that already exist',
      'UserDuplicationException',
      HttpStatus.CONFLICT,
    );
  }
}
