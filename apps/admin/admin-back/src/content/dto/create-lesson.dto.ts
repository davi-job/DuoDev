import { IsString, IsOptional, IsIn, IsUUID, MaxLength, IsInt, Min } from 'class-validator';

export class CreateLessonDto {
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

    @IsOptional()
    @IsString()
    @MaxLength(500)
    videoUrl?: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;
}
