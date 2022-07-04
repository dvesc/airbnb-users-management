import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class Process_code_exception extends My_exception {
  constructor() {
    super(
      'It looks like you are trying to use an already consumed process code',
      'ProcessCodeException',
      HttpStatus.CONFLICT,
    );
  }
}
