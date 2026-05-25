import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class BlogPost {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'idAutor' })
    autor: User;

    @Column()
    tag: string;

    @Column()
    titulo: string;

    @Column('text')
    descricao: string;

    @Column()
    corMiniatura: string;

    @CreateDateColumn()
    publicadoEm: Date;
}
