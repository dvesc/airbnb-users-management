import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class Invalid_user_id_exception extends My_exception {
  constructor() {
    super(
      "The 'user_id' does not match the id of the user who issued the token",
      'InvalidUserIdException',
      HttpStatus.CONFLICT,
    );
  }
}
