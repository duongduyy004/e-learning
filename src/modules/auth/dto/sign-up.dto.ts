import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'utils/constants';

export class SignUpDto {
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(PASSWORD_REGEX, {
    message: 'Password must have digits and letters, at least 8 character',
  })
  password: string;
}
