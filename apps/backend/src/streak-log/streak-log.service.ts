import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreakLog } from './streak-log.entity';

@Injectable()
export class StreakLogService {
    constructor(
        @InjectRepository(StreakLog)
        private streakLogRepository: Repository<StreakLog>,
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

        if (!log) {
            log = this.streakLogRepository.create({
                usuario: { id: idUsuario } as any,
                dataRegistro: hoje,
                concluido: true,
            });
        } else {
            log.concluido = true;
        }

        return this.streakLogRepository.save(log);
    }

    async calcularStreaks(idUsuario: string): Promise<{ sequenciaAtual: number; melhorSequencia: number }> {
        const logs = await this.streakLogRepository.find({
            where: { usuario: { id: idUsuario }, concluido: true },
            order: { dataRegistro: 'DESC' },
        });

        let sequenciaAtual = 0;
        let melhorSequencia = 0;
        let contador = 0;
        let dataAnterior: Date | null = null;

        for (const log of logs) {
            const dataAtual = new Date(log.dataRegistro);
            if (!dataAnterior) {
                contador = 1;
            } else {
                const diff = (dataAnterior.getTime() - dataAtual.getTime()) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    contador++;
                } else {
                    if (sequenciaAtual === 0) sequenciaAtual = contador;
                    if (contador > melhorSequencia) melhorSequencia = contador;
                    contador = 1;
                }
            }
            dataAnterior = dataAtual;
        }

        if (contador > 0) {
            if (sequenciaAtual === 0) sequenciaAtual = contador;
            if (contador > melhorSequencia) melhorSequencia = contador;
        }

        return { sequenciaAtual, melhorSequencia };
    }
}
