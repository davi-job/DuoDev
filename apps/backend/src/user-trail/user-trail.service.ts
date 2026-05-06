import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTrail } from './user-trail.entity';

@Injectable()
export class UserTrailService {
    constructor(
        @InjectRepository(UserTrail)
        private userTrailRepository: Repository<UserTrail>,
    ) {}

    findByUsuario(idUsuario: string): Promise<UserTrail[]> {
        return this.userTrailRepository.find({
            where: { usuario: { id: idUsuario } },
            relations: ['trail'],
        });
    }

    async updateProgresso(idUsuario: string, idTrilha: string, progressoPct: number): Promise<UserTrail> {
        let userTrail = await this.userTrailRepository.findOne({
            where: {
                usuario: { id: idUsuario },
                trail: { id: idTrilha },
            },
        });

        if (!userTrail) {
            userTrail = this.userTrailRepository.create({
                usuario: { id: idUsuario } as any,
                trail: { id: idTrilha } as any,
                progressoPct,
            });
        } else {
            userTrail.progressoPct = progressoPct;
        }

        return this.userTrailRepository.save(userTrail);
    }
}
