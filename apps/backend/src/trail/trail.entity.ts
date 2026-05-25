import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserTrail } from '../user-trail/user-trail.entity';

@Entity()
export class Trail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nome: string;

    @Column()
    nivel: string;

    @Column()
    duracao: string;

    @Column()
    totalHoras: number;

    @Column()
    ano: number;

    @Column()
    corMiniatura: string;

    @CreateDateColumn()
    criadoEm: Date;

    @OneToMany(() => UserTrail, (userTrail) => userTrail.trail)
    usuariosTrilhas: UserTrail[];
}
