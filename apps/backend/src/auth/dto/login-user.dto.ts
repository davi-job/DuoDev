import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    turnstileToken?: string;
}
