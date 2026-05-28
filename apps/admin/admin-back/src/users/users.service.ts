import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '@duodev/db';
import type { DB } from '@duodev/db';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async findMe(id: string) {
        const [user] = await this.db
            .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!user) throw new NotFoundException('Usuário não encontrado');
        return user;
    }

    async updateProfile(id: string, dto: UpdateProfileDto) {
        if (!dto.name && !dto.email) {
            throw new BadRequestException('Informe ao menos um campo para atualizar');
        }

        if (dto.email) {
            const [existing] = await this.db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.email, dto.email))
                .limit(1);

            if (existing && existing.id !== id) {
                throw new ConflictException('Este e-mail já está em uso');
            }
        }

        const [updated] = await this.db
            .update(users)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

        return updated;
    }

    async updatePassword(id: string, dto: UpdatePasswordDto) {
        const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!user) throw new NotFoundException('Usuário não encontrado');

        const valid = await bcrypt.compare(dto.senhaAtual, user.password);
        if (!valid) throw new UnauthorizedException('Senha atual incorreta');

        const hash = await bcrypt.hash(dto.novaSenha, 10);
        await this.db.update(users).set({ password: hash, updatedAt: new Date() }).where(eq(users.id, id));
    }
}
