import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Trail } from '../trail/trail.entity';

@Entity()
export class UserTrail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idUsuario' })
    usuario: User;

    @ManyToOne(() => Trail, (trail) => trail.usuariosTrilhas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idTrilha' })
    trail: Trail;

    @Column({ default: 0 })
    progressoPct: number;

    @CreateDateColumn()
    iniciadoEm: Date;

    @UpdateDateColumn()
    atualizadoEm: Date;
}
