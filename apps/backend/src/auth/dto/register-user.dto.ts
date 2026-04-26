import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
            'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    })
    password: string;
}
