import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { users } from '@duodev/db';
import type { DB } from '@duodev/db';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject('DB') private readonly db: DB,
        private readonly jwtService: JwtService,
    ) {}

    async login(dto: LoginDto) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, dto.email))
            .limit(1);

        if (!user || user.role !== 'admin') {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, name: user.name, email: user.email },
        };
    }
}
