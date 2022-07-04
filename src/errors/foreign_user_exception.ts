import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class Foreign_user_exception extends My_exception {
  constructor() {
    super(
      'This user does not belong to you',
      'ForeignUserException',
      HttpStatus.CONFLICT,
    );
  }
}
