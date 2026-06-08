import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({ where: { email } });
        return user === null ? undefined : user;
    }

    async findOneById(id: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({ where: { id } });
        return user === null ? undefined : user;
    }

    // Métodos adicionais para o perfil
    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({ where: { email } });
        return user === null ? undefined : user;
    }

    async update(id: string, data: { name?: string; email?: string }): Promise<User> {
        const user = await this.findById(id);

        // Atualiza apenas os campos fornecidos
        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;

        return this.usersRepository.save(user);
    }

    async incrementXp(id: string, amount: number): Promise<User> {
        const safeAmount = Math.max(0, Math.round(amount));
        const user = await this.findById(id);

        if (safeAmount === 0) {
            return user;
        }

        user.xp = Math.max(0, (user.xp ?? 0) + safeAmount);
        return this.usersRepository.save(user);
    }

    async syncStreak(id: string, streak: { sequenciaAtual: number; melhorSequencia: number }): Promise<User> {
        const user = await this.findById(id);
        user.streakCurrent = Math.max(0, streak.sequenciaAtual);
        user.streakBest = Math.max(user.streakBest ?? 0, streak.melhorSequencia);
        return this.usersRepository.save(user);
    }

    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        const user = await this.findById(id);
        user.password = hashedPassword;
        await this.usersRepository.save(user);
    }

    async updateUserPreferences(
        id: string,
        updateUserPreferencesDto: UpdateUserPreferencesDto,
    ): Promise<User> {
        const user = await this.findById(id);

        if (updateUserPreferencesDto.language !== undefined) {
            user.language = updateUserPreferencesDto.language;
        }
        if (updateUserPreferencesDto.interests !== undefined) {
            user.interests = updateUserPreferencesDto.interests;
        }
        // if (updateUserPreferencesDto.interestReason !== undefined) {
        //     user.interestReason = updateUserPreferencesDto.interestReason;
        // }
        if (updateUserPreferencesDto.onboardingCompleted !== undefined) {
            user.onboardingCompleted = updateUserPreferencesDto.onboardingCompleted;
        }

        return this.usersRepository.save(user);
    }
}
