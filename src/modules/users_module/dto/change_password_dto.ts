import { IsEmail } from 'class-validator';

export class Change_password_dto {
  @IsEmail({ message: 'this property must be a valid email' })
  email: string;
}
