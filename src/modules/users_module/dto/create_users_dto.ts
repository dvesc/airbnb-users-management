import {
  IsAscii,
  IsBoolean,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';

export class phone_number_property_dto {
  @Matches(/\+[0-9]{1,3}/g, { message: 'must be a code in valid format +DDD' })
  country_code: string;
  @IsNumber()
  number: string;
}

export class profile_pic_property_dto {
  @IsOptional()
  @Matches(/^data:([A-Za-z-+\/]+);base64,(.+)$/, {
    message: 'profile_pic must contain a valid base64 string',
  })
  file?: string;
}

export class CreateUsersModuleDto {
  @IsAscii()
  first_name: string;

  @IsAscii()
  last_name: string;

  @IsOptional()
  profile_pic?: profile_pic_property_dto;

  @Matches(/^([0-2][0-9]|3[0-1])(-)(0[1-9]|1[0-2])\2(\d{4})$/, {
    message: 'date_of_birth must be a valid date format (DD-MM-YYYY)',
  })
  date_of_birth: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#.$($)$-$_])[A-Za-z\d$@$!%*?&#.$($)$-$_]{8,15}$/,
    {
      message:
        'the password must contain: ' +
        'Minimum 8 characters and maximum 15, ' +
        'at least one capital letter, ' +
        'at least one lowercase letter, ' +
        'at least one digit, no blank spaces' +
        'and at least 1 special character like @!%*?&#.$',
    },
  )
  password: string;

  @IsNotEmptyObject()
  phone_number: phone_number_property_dto;

  @IsBoolean()
  notifications: boolean;
}
