import { IsEmail, IsString, MinLength, Matches, Length } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(4, 4)
    token: string;

    @IsString()
    @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
            'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    })
    newPassword: string;
}
