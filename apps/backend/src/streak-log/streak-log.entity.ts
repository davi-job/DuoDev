import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class StreakLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idUsuario' })
    usuario: User;

    @Column({ type: 'date' })
    dataRegistro: string;

    @Column({ default: false })
    concluido: boolean;
}
