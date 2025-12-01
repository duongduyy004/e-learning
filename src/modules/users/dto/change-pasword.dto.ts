import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from 'utils/constants';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'newPassword is required!' })
  currentPassword: string;

  @IsNotEmpty({ message: 'newPassword is required!' })
  @Matches(PASSWORD_REGEX, {
    message: 'Password must have digits and letters, at least 8 character',
  })
  newPassword: string;

  @IsNotEmpty({ message: 'confirmPassword is required!' })
  confirmPassword: string;
}
