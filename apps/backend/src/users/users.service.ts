import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UserTrail } from '../user-trail/user-trail.entity';
import { StreakLog } from '../streak-log/streak-log.entity';

type LeaderboardEntry = {
    rank: number;
    userId: string;
    name: string;
    xp: number;
    streakCurrent: number;
    weeklyScore: number;
    studyDays: number;
    trailMoves: number;
    trailStarts: number;
    completedTrails: number;
    isCurrentUser: boolean;
};

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(UserTrail)
        private userTrailRepository: Repository<UserTrail>,
        @InjectRepository(StreakLog)
        private streakLogRepository: Repository<StreakLog>,
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

    async getWeeklyLeaderboard(currentUserId: string): Promise<{
        period: { label: string; startsAt: string; endsAt: string };
        top: LeaderboardEntry[];
        currentUser: LeaderboardEntry | null;
    }> {
        const now = new Date();
        const startsAt = new Date(now);
        startsAt.setHours(0, 0, 0, 0);
        startsAt.setDate(startsAt.getDate() - 6);

        const users = await this.usersRepository.find();

        const streakRows = await this.streakLogRepository
            .createQueryBuilder('streak')
            .select('streak.idUsuario', 'userId')
            .addSelect('COUNT(*)', 'studyDays')
            .where('streak.concluido = true')
            .andWhere('streak.dataRegistro >= :startsAt', { startsAt: startsAt.toISOString().slice(0, 10) })
            .groupBy('streak.idUsuario')
            .getRawMany<{ userId: string; studyDays: string }>();

        const trailMoveRows = await this.userTrailRepository
            .createQueryBuilder('userTrail')
            .select('userTrail.idUsuario', 'userId')
            .addSelect('COUNT(*)', 'trailMoves')
            .where('userTrail.atualizadoEm >= :startsAt', { startsAt })
            .groupBy('userTrail.idUsuario')
            .getRawMany<{ userId: string; trailMoves: string }>();

        const trailStartRows = await this.userTrailRepository
            .createQueryBuilder('userTrail')
            .select('userTrail.idUsuario', 'userId')
            .addSelect('COUNT(*)', 'trailStarts')
            .where('userTrail.iniciadoEm >= :startsAt', { startsAt })
            .groupBy('userTrail.idUsuario')
            .getRawMany<{ userId: string; trailStarts: string }>();

        const completedTrailRows = await this.userTrailRepository
            .createQueryBuilder('userTrail')
            .select('userTrail.idUsuario', 'userId')
            .addSelect('COUNT(*)', 'completedTrails')
            .where('userTrail.atualizadoEm >= :startsAt', { startsAt })
            .andWhere('userTrail.progressoPct >= 100')
            .groupBy('userTrail.idUsuario')
            .getRawMany<{ userId: string; completedTrails: string }>();

        const studyDaysByUser = new Map(streakRows.map((row) => [row.userId, Number(row.studyDays)]));
        const trailMovesByUser = new Map(trailMoveRows.map((row) => [row.userId, Number(row.trailMoves)]));
        const trailStartsByUser = new Map(trailStartRows.map((row) => [row.userId, Number(row.trailStarts)]));
        const completedTrailsByUser = new Map(
            completedTrailRows.map((row) => [row.userId, Number(row.completedTrails)]),
        );

        const ranked = users
            .map((user) => {
                const studyDays = studyDaysByUser.get(user.id) ?? 0;
                const trailMoves = trailMovesByUser.get(user.id) ?? 0;
                const trailStarts = trailStartsByUser.get(user.id) ?? 0;
                const completedTrails = completedTrailsByUser.get(user.id) ?? 0;
                const weeklyScore =
                    studyDays * 40 +
                    trailMoves * 18 +
                    trailStarts * 22 +
                    completedTrails * 60 +
                    Math.min(user.streakCurrent ?? 0, 7) * 12;

                return {
                    userId: user.id,
                    name: user.name?.trim() || 'Usuário',
                    xp: user.xp ?? 0,
                    streakCurrent: user.streakCurrent ?? 0,
                    weeklyScore,
                    studyDays,
                    trailMoves,
                    trailStarts,
                    completedTrails,
                    isCurrentUser: user.id === currentUserId,
                };
            })
            .filter((entry) => entry.weeklyScore > 0 || entry.xp > 0 || entry.streakCurrent > 0)
            .sort((a, b) => {
                if (b.weeklyScore !== a.weeklyScore) return b.weeklyScore - a.weeklyScore;
                if (b.xp !== a.xp) return b.xp - a.xp;
                if (b.streakCurrent !== a.streakCurrent) return b.streakCurrent - a.streakCurrent;
                return a.name.localeCompare(b.name, 'pt-BR');
            })
            .map((entry, index) => ({
                rank: index + 1,
                ...entry,
            }));

        const top = ranked.slice(0, 10);
        const currentUser = ranked.find((entry) => entry.userId === currentUserId) ?? null;

        return {
            period: {
                label: 'Últimos 7 dias',
                startsAt: startsAt.toISOString(),
                endsAt: now.toISOString(),
            },
            top,
            currentUser,
        };
    }
}
