import { IsString, IsOptional, IsIn, IsUUID, MaxLength, IsInt, Min } from 'class-validator';

export class CreateChallengeDto {
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
    instructions?: string;

    @IsOptional()
    @IsIn(['publicado', 'rascunho', 'arquivado'])
    status?: string;
}
