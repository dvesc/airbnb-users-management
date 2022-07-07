import { Matches } from 'class-validator';

export class New_password_dto {
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
}
