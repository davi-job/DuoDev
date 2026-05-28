import {
    IsString, IsOptional, IsIn, IsInt, IsArray,
    ValidateNested, MaxLength, IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportElementDto {
    @IsString()
    id!: string;

    @IsIn(['texto', 'imagem'])
    type!: 'texto' | 'imagem';

    @IsString()
    content!: string;

    @IsInt()
    order!: number;
}

export class ImportLessonDto {
    @IsOptional()
    @IsInt()
    order?: number;

    @IsString()
    @MaxLength(255)
    title!: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportElementDto)
    elements!: ImportElementDto[];
}

export class ImportQuestionDto {
    @IsOptional()
    @IsInt()
    order?: number;

    @IsString()
    @MaxLength(255)
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    alternatives!: { id: string; text: string }[];

    @IsString()
    answer!: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;
}

export class ImportChallengeDto {
    @IsOptional()
    @IsInt()
    order?: number;

    @IsString()
    @MaxLength(255)
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    instructions?: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;
}

export class ImportTrailDto {
    @IsString()
    @MaxLength(255)
    name!: string;

    @IsIn(['iniciante', 'intermediário', 'avançado'])
    level!: string;

    @IsString()
    description!: string;

    @IsString()
    thumbColor!: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsInt()
    totalHours?: number;

    @IsOptional()
    @IsInt()
    year?: number;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'revisao', 'arquivado'])
    status?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportLessonDto)
    lessons!: ImportLessonDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportQuestionDto)
    questions!: ImportQuestionDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportChallengeDto)
    challenges!: ImportChallengeDto[];
}

export class ImportCategoryDto {
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
    icon?: string;

    @IsString()
    thumbColor!: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsInt()
    totalHours?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportTrailDto)
    trails!: ImportTrailDto[];
}

export class ImportContentDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportCategoryDto)
    categories!: ImportCategoryDto[];
}
