import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class Existent_user_exception extends My_exception {
  constructor() {
    super(
      'This user already exists',
      'ExistentUserException',
      HttpStatus.CONFLICT,
    );
  }
}
