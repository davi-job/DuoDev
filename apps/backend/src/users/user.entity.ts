import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    name: string;

    @Exclude()
    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    avatarUrl?: string;

    @Column({ default: 'en' }) // Default language
    language: string;

    @Column('simple-array', { nullable: true }) // Stores interests as a comma-separated string
    interests: string[];

    // @Column({ nullable: true })
    // interestReason?: string;

    @Column({ default: false })
    onboardingCompleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
