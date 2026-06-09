import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

export class TrailMetadataDto {
    @IsOptional()
    @IsString()
    @MaxLength(140)
    heroTagline?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    estimatedXp?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    recommendedDays?: number;

    @IsOptional()
    @IsString()
    missionPrompt?: string;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    completionBadgeLabel?: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    focusTags?: string[];
}

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

    @IsOptional()
    @ValidateNested()
    @Type(() => TrailMetadataDto)
    metadata?: TrailMetadataDto;
}
