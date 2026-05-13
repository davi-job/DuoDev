import { IsString, IsOptional, IsIn, MaxLength, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MaxLength(255)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'revisao', 'arquivado'])
    status?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    icon?: string;

    @IsString()
    @MaxLength(50)
    thumbColor!: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    duration?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    totalHours?: number;
}
