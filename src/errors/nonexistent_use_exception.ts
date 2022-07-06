import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class Nonexistent_user_exception extends My_exception {
  constructor() {
    super(
      'This user does not exist',
      'NonexistentUserException',
      HttpStatus.NOT_FOUND,
    );
  }
}
