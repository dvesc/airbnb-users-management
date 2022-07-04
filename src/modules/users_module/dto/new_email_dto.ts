import { IsEmail } from 'class-validator';

export class Change_email_dto {
  @IsEmail({ message: 'this property must be a valid email' })
  new_email: string;
}
