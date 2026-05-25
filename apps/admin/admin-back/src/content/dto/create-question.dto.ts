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

    @IsIn(['multiple-choice', 'code-reading', 'fill-blank'])
    questionType!: 'multiple-choice' | 'code-reading' | 'fill-blank';

    @IsOptional()
    @IsString()
    codeSnippet?: string;

    @IsOptional()
    @IsString()
    sentence?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    blanks?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    correctOrder?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AlternativeDto)
    alternatives?: AlternativeDto[];

    @IsOptional()
    @IsString()
    @MaxLength(255)
    answer?: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;
}
