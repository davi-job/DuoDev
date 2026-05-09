import { IsArray, IsIn, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderItemDto {
    @IsUUID()
    id!: string;

    @IsIn(['aula', 'questao', 'desafio'])
    type!: 'aula' | 'questao' | 'desafio';

    @IsInt()
    @Min(0)
    order!: number;
}

export class ReorderContentDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    items!: ReorderItemDto[];
}
