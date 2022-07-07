import { HttpStatus } from '@nestjs/common';
import { My_exception } from './my_exception';

export class Exceeds_the_date_range_exception extends My_exception {
  constructor() {
    super(
      'this date exceeds the allowed range, minimum 18 and maximum 120 years',
      'ExceedsTheDateRangeException',
      HttpStatus.BAD_REQUEST,
    );
  }
}
