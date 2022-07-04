import { IsAlphanumeric, IsEmail } from 'class-validator';

export class New_password_dto {
  @IsAlphanumeric()
  password: string;
}
