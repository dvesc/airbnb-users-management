import { IsEmail } from 'class-validator';

export class Registration_process_dto {
  @IsEmail({ message: 'this property must be a valid email' })
  email: string;
}
