import { IsString, IsOptional, IsIn, IsUUID, MaxLength, IsInt, Min } from 'class-validator';

export class CreateTrailDto {
    @IsUUID()
    categoryId!: string;

    @IsString()
    @MaxLength(255)
    name!: string;

    @IsString()
    @MaxLength(100)
    level!: string;

    @IsString()
    description!: string;

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

    @IsOptional()
    @IsInt()
    year?: number;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'revisao', 'arquivado'])
    status?: string;
}
