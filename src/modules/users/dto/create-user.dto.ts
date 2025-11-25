import { I18nTranslations } from "@/generated/i18n.generated";
import { PASSWORD_REGEX } from "utils/constants";
import { Transform } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { Role } from "@/modules/roles/role.domain";

export class CreateUserDto {

    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
    @IsString()
    name: string;

    @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_EMAIL') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
    email: string;

    @IsString()
    @Matches(PASSWORD_REGEX, { message: i18nValidationMessage<I18nTranslations>('validation.PASSWORD') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
    password: string;

    @IsString()
    @IsEnum(['male', 'female'])
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
    gender: string;

    @IsDate()
    @Transform(({ value }) => {
        if (!value) return undefined;

        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = value.match(dateRegex);

        if (match) {
            const [, month, day, year] = match;
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            if (date.getFullYear() == year &&
                date.getMonth() == month - 1 &&
                date.getDate() == day) {
                return date;
            }
        }

        const fallbackDate = new Date(value);
        if (isNaN(fallbackDate.getTime())) {
            throw new Error('Invalid date format. Expected MM/DD/YYYY or valid date string');
        }

        return fallbackDate;
    })
    dayOfBirth: Date;

    roleId?: Role['id'];
}
