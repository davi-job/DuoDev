import { IsString, IsOptional, IsIn, IsUUID, MaxLength, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LessonElementDto {
    @IsString()
    id!: string;

    @IsIn(['texto', 'imagem'])
    type!: 'texto' | 'imagem';

    @IsString()
    content!: string;

    @IsInt()
    @Min(0)
    order!: number;
}

export class CreateLessonDto {
    @IsUUID()
    trailId!: string;

    @IsInt()
    @Min(0)
    order!: number;

    @IsString()
    @MaxLength(255)
    title!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonElementDto)
    elements!: LessonElementDto[];

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;
}
