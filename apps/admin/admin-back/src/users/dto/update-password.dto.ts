import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    senhaAtual!: string;

    @IsString()
    @MinLength(6)
    novaSenha!: string;
}
