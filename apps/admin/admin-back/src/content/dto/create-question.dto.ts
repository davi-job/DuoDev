import { IsString, IsOptional, IsIn, IsUUID, MaxLength, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AlternativeDto {
    @IsString()
    id!: string;

    @IsString()
    text!: string;
}

export class CreateQuestionDto {
    @IsUUID()
    trailId!: string;

    @IsInt()
    @Min(0)
    order!: number;

    @IsString()
    @MaxLength(255)
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AlternativeDto)
    alternatives!: AlternativeDto[];

    @IsString()
    @MaxLength(255)
    answer!: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;
}
