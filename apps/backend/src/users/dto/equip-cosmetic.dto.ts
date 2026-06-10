import { IsUUID } from 'class-validator';

export class EquipCosmeticDto {
    @IsUUID()
    cosmeticItemId!: string;
}
