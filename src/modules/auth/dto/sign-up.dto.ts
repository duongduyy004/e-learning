import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, Matches } from "class-validator";
import { PASSWORD_REGEX } from "utils/constants";

export class SignUpDto {
    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @Matches(PASSWORD_REGEX, { message: 'Password must have digits and letters, at least 8 character' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Gender is required' })
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
}