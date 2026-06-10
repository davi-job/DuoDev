import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreakLog } from './streak-log.entity';
import { UsersService } from '../users/users.service';
import { GamificationService } from '../gamification/gamification.service';
import { XP_RULE_CODES } from '../users/gamification.util';

@Injectable()
export class StreakLogService {
    constructor(
        @InjectRepository(StreakLog)
        private streakLogRepository: Repository<StreakLog>,
        private usersService: UsersService,
        private gamificationService: GamificationService,
    ) {}

    findByUsuario(idUsuario: string): Promise<StreakLog[]> {
        return this.streakLogRepository.find({
            where: { usuario: { id: idUsuario } },
            order: { dataRegistro: 'DESC' },
        });
    }

    async registrarHoje(idUsuario: string): Promise<StreakLog> {
        const hoje = new Date().toISOString().split('T')[0];

        let log = await this.streakLogRepository.findOne({
            where: {
                usuario: { id: idUsuario },
                dataRegistro: hoje,
            },
        });
        const shouldReward = !log || !log.concluido;

        if (!log) {
            log = this.streakLogRepository.create({
                usuario: { id: idUsuario } as any,
                dataRegistro: hoje,
                concluido: true,
            });
        } else {
            log.concluido = true;
        }

        const savedLog = await this.streakLogRepository.save(log);
        const completedLogs = await this.findByUsuario(idUsuario);
        const previousCompletedDay = completedLogs.find(
            (entry) => entry.concluido && entry.dataRegistro < hoje && entry.dataRegistro !== hoje,
        )?.dataRegistro;

        if (previousCompletedDay) {
            await this.gamificationService.applyStreakFreezeForGap(idUsuario, previousCompletedDay, hoje);
        }

        const streak = await this.calcularStreaks(idUsuario);
        await this.usersService.syncStreak(idUsuario, streak);

        if (shouldReward) {
            const points = await this.gamificationService.getXpPoints(XP_RULE_CODES.streakLogged);
            await this.gamificationService.grantXp(idUsuario, points, {
                source: 'streak_logged',
                reason: 'Você manteve sua sequência de estudo.',
                type: 'streak',
            });
        }

        return savedLog;
    }

    async calcularStreaks(idUsuario: string): Promise<{ sequenciaAtual: number; melhorSequencia: number }> {
        const logs = await this.streakLogRepository.find({
            where: { usuario: { id: idUsuario }, concluido: true },
            order: { dataRegistro: 'DESC' },
        });
        const protectedDates = await this.gamificationService.getStreakFreezeDates(idUsuario);
        const uniqueDates = new Set<string>();

        for (const log of logs) {
            uniqueDates.add(log.dataRegistro);
        }

        for (const date of protectedDates) {
            uniqueDates.add(date);
        }

        const sortedDates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));

        if (!sortedDates.length) {
            return { sequenciaAtual: 0, melhorSequencia: 0 };
        }

        const bestSequence = countBestStreak(sortedDates);
        const currentSequence = countCurrentStreak(sortedDates);

        return { sequenciaAtual: currentSequence, melhorSequencia: bestSequence };
    }
}

function countCurrentStreak(sortedDatesDesc: string[]) {
    let current = 1;

    for (let i = 0; i < sortedDatesDesc.length - 1; i++) {
        if (diffDays(sortedDatesDesc[i + 1], sortedDatesDesc[i]) === 1) {
            current++;
            continue;
        }
        break;
    }

    return current;
}

function countBestStreak(sortedDatesDesc: string[]) {
    const asc = [...sortedDatesDesc].sort((a, b) => a.localeCompare(b));
    let best = 1;
    let current = 1;

    for (let i = 1; i < asc.length; i++) {
        if (diffDays(asc[i - 1], asc[i]) === 1) {
            current++;
        } else {
            best = Math.max(best, current);
            current = 1;
        }
    }

    return Math.max(best, current);
}

function diffDays(startIso: string, endIso: string) {
    const start = new Date(`${startIso}T00:00:00.000Z`);
    const end = new Date(`${endIso}T00:00:00.000Z`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
