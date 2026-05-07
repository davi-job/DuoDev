import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserPreferencesDto {
    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    interests?: string[];

    @IsOptional()
    @IsBoolean()
    onboardingCompleted?: boolean;
}
