import { PartialType } from '@nestjs/mapped-types';
import {
  IsAscii,
  IsBoolean,
  IsNotEmptyObject,
  IsOptional,
  Matches,
} from 'class-validator';
import { CreateUsersModuleDto } from './create_users_dto';

export class profile_pic_property_dto {
  @Matches(/^data:([A-Za-z-+\/]+);base64,(.+)$/, {
    message: 'profile_pic must contain a valid base64 string',
  })
  file: string;
}

export class Update_users_dto extends PartialType(CreateUsersModuleDto) {
  @IsOptional()
  @IsAscii()
  first_name?: string;

  @IsOptional()
  @IsAscii()
  last_name?: string;

  @IsOptional()
  @IsNotEmptyObject()
  profile_pic?: profile_pic_property_dto;

  @IsOptional()
  @Matches(/^([0-2][0-9]|3[0-1])(-)(0[1-9]|1[0-2])\2(\d{4})$/, {
    message: 'date_of_birth must be a valid date format (DD-MM-YYYY)',
  })
  date_of_birth?: string;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @IsOptional()
  @Matches(/male|female|other/gi, {
    message: 'the gener only can be male, female and other ',
  })
  gender?: string;
}
