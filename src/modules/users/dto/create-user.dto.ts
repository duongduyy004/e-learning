import { I18nTranslations } from "@/generated/i18n.generated";
import { PASSWORD_REGEX } from "utils/constants";
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { Role } from "@/modules/roles/role.domain";
import { AuthProvidersEnum } from "modules/auth/auth-providers.enum";

export class CreateUserDto {

    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
    @IsString()
    name: string;

    @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_EMAIL') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
    email: string;

    @IsString()
    @Matches(PASSWORD_REGEX, { message: i18nValidationMessage<I18nTranslations>('validation.PASSWORD') })
    password?: string;

    @IsString()
    @IsOptional()
    socialId?: string;

    @IsString()
    @IsOptional()
    @IsEnum(AuthProvidersEnum)
    provider?: string;

    roleId?: Role['id'];

    @IsBoolean()
    @IsOptional()
    isEmailVerified?: boolean;

    @IsString()
    @IsOptional()
    avatar?: string;
}
