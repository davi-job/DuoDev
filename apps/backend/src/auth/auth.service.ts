import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UserTrailService } from '../user-trail/user-trail.service';
import { StreakLogService } from '../streak-log/streak-log.service';
import { buildGamificationSnapshot } from '../users/gamification.util';

type PendingRegistration = {
    code: string;
    expiresAt: Date;
    data: Omit<RegisterUserDto, 'turnstileToken'>;
};

type PendingPasswordReset = {
    code: string;
    expiresAt: Date;
    email: string;
};


// Armazena { code, expiresAt, registerData }
const pendingRegistrations = new Map<string, PendingRegistration>();
const pendingRegistrationsFile = path.join(os.tmpdir(), 'duodev-pending-registrations.json');

const pendingResets = new Map<string, PendingPasswordReset>();
const pendingResetsFile = path.join(os.tmpdir(), 'duodev-pending-resets.json');

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailerService: MailerService,
        private configService: ConfigService,
        private userTrailService: UserTrailService,
        private streakLogService: StreakLogService,
    ) {}

    private isProduction(): boolean {
        return this.configService.get<string>('NODE_ENV') === 'production';
    }

    private async loadPendingRegistrations(): Promise<void> {
        if (this.isProduction()) {
            return;
        }

        try {
            const raw = await fs.readFile(pendingRegistrationsFile, 'utf-8');
            const entries = JSON.parse(raw) as Array<
                [string, Omit<PendingRegistration, 'expiresAt'> & { expiresAt: string }]
            >;

            pendingRegistrations.clear();
            for (const [email, entry] of entries) {
                pendingRegistrations.set(email, {
                    ...entry,
                    expiresAt: new Date(entry.expiresAt),
                });
            }
        } catch (error: any) {
            if (error?.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    private async loadPendingResets(): Promise<void> {
        if (this.isProduction()) {
            return;
        }

        try {
            const raw = await fs.readFile(pendingResetsFile, 'utf-8');
            const entries = JSON.parse(raw) as Array<
                [string, Omit<PendingPasswordReset, 'expiresAt'> & { expiresAt: string }]
            >;

            pendingResets.clear();
            for (const [email, entry] of entries) {
                pendingResets.set(email, {
                    ...entry,
                    expiresAt: new Date(entry.expiresAt),
                });
            }
        } catch (error: any) {
            if (error?.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    private async savePendingResets(): Promise<void> {
        if (this.isProduction()) {
            return;
        }

        const entries = Array.from(pendingResets.entries()).map(([email, entry]) => [
            email,
            {
                ...entry,
                expiresAt: entry.expiresAt.toISOString(),
            },
        ]);

        await fs.writeFile(pendingResetsFile, JSON.stringify(entries), 'utf-8');
    }

    async forgotPassword(email: string): Promise<{ message: string; devCode?: string }> {
        await this.loadPendingResets();

        // Verifica se o usuário existe
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            // Por segurança, não revelamos se o email existe ou não
            return { message: 'Se o email estiver cadastrado, você receberá um código de recuperação' };
        }

        const code = crypto.randomInt(1000, 9999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        pendingResets.set(email, {
            code,
            expiresAt,
            email,
        });
        await this.savePendingResets();

        const mailHost = this.configService.get<string>('MAIL_HOST');
        const mailPort = this.configService.get<string>('MAIL_PORT');
        const mailUser = this.configService.get<string>('MAIL_USER');
        const mailPass = this.configService.get<string>('MAIL_PASS');
        const hasMailerConfig = !!(mailHost && mailPort && mailUser && mailPass);

        if (hasMailerConfig) {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Código de recuperação de senha',
                text: `Seu código de recuperação de senha é: ${code}. Ele expira em 10 minutos.`,
            });

            return { message: 'Código enviado para o e-mail' };
        }

        if (this.isProduction()) {
            throw new InternalServerErrorException('SMTP não configurado para envio do código de recuperação.');
        }

        console.log(`[auth/forgot-password] Modo dev sem SMTP. Código para ${email}: ${code}`);
        return {
            message: 'Código gerado em modo de desenvolvimento',
            devCode: code,
        };
    }

    async verifyResetCode(email: string, code: string): Promise<{ message: string }> {
        await this.loadPendingResets();

        const pending = pendingResets.get(email);

        if (!pending) {
            throw new BadRequestException('Nenhuma solicitação de recuperação encontrada para esse e-mail');
        }

        if (new Date() > pending.expiresAt) {
            pendingResets.delete(email);
            await this.savePendingResets();
            throw new BadRequestException('Código expirado. Solicite uma nova recuperação.');
        }

        if (pending.code !== code) {
            throw new BadRequestException('Código inválido');
        }

        return { message: 'Código verificado com sucesso' };
    }    

    async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
        await this.loadPendingResets();

        const pending = pendingResets.get(email);

        if (!pending) {
            throw new BadRequestException('Nenhuma solicitação de recuperação encontrada para esse e-mail');
        }

        if (new Date() > pending.expiresAt) {
            pendingResets.delete(email);
            await this.savePendingResets();
            throw new BadRequestException('Código expirado. Solicite uma nova recuperação.');
        }

        if (pending.code !== token) {
            throw new BadRequestException('Código inválido');
        }

        // Usar o UsersService para atualizar a senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Primeiro encontra o usuário pelo email
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Atualiza a senha usando o UsersService
        await this.usersService.updatePassword(user.id, hashedPassword);

        // Remove a solicitação pendente
        pendingResets.delete(email);
        await this.savePendingResets();

        return { message: 'Senha redefinida com sucesso' };
    }   

    private async savePendingRegistrations(): Promise<void> {
        if (this.isProduction()) {
            return;
        }

        const entries = Array.from(pendingRegistrations.entries()).map(([email, entry]) => [
            email,
            {
                ...entry,
                expiresAt: entry.expiresAt.toISOString(),
            },
        ]);

        await fs.writeFile(pendingRegistrationsFile, JSON.stringify(entries), 'utf-8');
    }

    private async verifyTurnstile(token?: string): Promise<void> {
        if (token === 'dev-turnstile-bypass') {
            return;
        }

        const secret = this.configService.get<string>('TURNSTILE_SECRET_KEY');
        if (!secret) {
            return;
        }

        if (!token) {
            throw new BadRequestException('Verificação de segurança não enviada.');
        }

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret,
                response: token,
            }),
        });

        if (!response.ok) {
            throw new InternalServerErrorException('Falha ao validar a verificação de segurança.');
        }

        const result = (await response.json()) as { success?: boolean };
        if (!result.success) {
            throw new BadRequestException('Verificação de segurança inválida.');
        }
    }

    async register(registerUserDto: RegisterUserDto): Promise<{ message: string; devCode?: string }> {
        await this.verifyTurnstile(registerUserDto.turnstileToken);
        const { turnstileToken, ...registerData } = registerUserDto;
        await this.loadPendingRegistrations();

        const existingUser = await this.usersService.findOneByEmail(registerUserDto.email);
        if (existingUser) {
            throw new BadRequestException('Usuário com esse email já existe!');
        }

        const code = crypto.randomInt(1000, 9999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        pendingRegistrations.set(registerUserDto.email, {
            code,
            expiresAt,
            data: registerData,
        });
        await this.savePendingRegistrations();

        const mailHost = this.configService.get<string>('MAIL_HOST');
        const mailPort = this.configService.get<string>('MAIL_PORT');
        const mailUser = this.configService.get<string>('MAIL_USER');
        const mailPass = this.configService.get<string>('MAIL_PASS');
        const hasMailerConfig = !!(mailHost && mailPort && mailUser && mailPass);

        if (hasMailerConfig) {
            await this.mailerService.sendMail({
                to: registerUserDto.email,
                subject: 'Código de verificação',
                text: `Seu código de verificação é: ${code}. Ele expira em 10 minutos.`,
            });

            return { message: 'Código enviado para o e-mail' };
        }

        if (this.isProduction()) {
            throw new InternalServerErrorException('SMTP não configurado para envio do código de verificação.');
        }

        console.log(`[auth/register] Modo dev sem SMTP. Código para ${registerUserDto.email}: ${code}`);
        return {
            message: 'Código gerado em modo de desenvolvimento',
            devCode: code,
        };
    }

    async verifyCode(verifyCodeDto: VerifyCodeDto) {
        await this.loadPendingRegistrations();
        const pending = pendingRegistrations.get(verifyCodeDto.email);

        if (!pending) {
            throw new BadRequestException('Nenhum cadastro pendente para esse e-mail');
        }
        if (new Date() > pending.expiresAt) {
            pendingRegistrations.delete(verifyCodeDto.email);
            await this.savePendingRegistrations();
            throw new BadRequestException('Código expirado. Faça o cadastro novamente.');
        }
        if (pending.code !== verifyCodeDto.code) {
            throw new BadRequestException('Código inválido');
        }

        const existingUser = await this.usersService.findOneByEmail(verifyCodeDto.email);
        if (existingUser) {
            pendingRegistrations.delete(verifyCodeDto.email);
            await this.savePendingRegistrations();
            throw new BadRequestException('Usuário com esse email já existe!');
        }

        const hashedPassword = await bcrypt.hash(pending.data.password, 10);
        const user = await this.usersService.create({
            ...pending.data,
            password: hashedPassword,
        });

        pendingRegistrations.delete(verifyCodeDto.email);
        await this.savePendingRegistrations();

        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: await this.getProfile(user.id),
        };
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        // Ensure user exists and has a password before comparing
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginUserDto: LoginUserDto) {
        await this.verifyTurnstile(loginUserDto.turnstileToken);

        const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas!');
        }
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: await this.getProfile(user.id),
        };
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Se estiver atualizando email, verifica se já existe
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const emailExists = await this.usersService.findOneByEmail(updateProfileDto.email);
            if (emailExists) {
                throw new ConflictException('Este email já está em uso');
            }
        }

        await this.usersService.update(userId, updateProfileDto);
        return this.getProfile(userId);
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Ensure user has a password before comparing
        if (!user.password) {
            throw new BadRequestException('Usuário não possui senha definida.');
        }

        // Verifica se a senha atual está correta
        const isPasswordValid = await bcrypt.compare(changePasswordDto.senhaAtual, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Senha atual incorreta');
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(changePasswordDto.novaSenha, 10);

        // Atualiza a senha
        await this.usersService.updatePassword(userId, hashedPassword);

        return { message: 'Senha alterada com sucesso' };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        const [trails, liveStreak] = await Promise.all([
            this.userTrailService.findByUsuario(userId),
            this.streakLogService.calcularStreaks(userId),
        ]);

        if (
            user.streakCurrent !== liveStreak.sequenciaAtual ||
            user.streakBest !== liveStreak.melhorSequencia
        ) {
            await this.usersService.syncStreak(userId, liveStreak);
            user.streakCurrent = liveStreak.sequenciaAtual;
            user.streakBest = Math.max(user.streakBest ?? 0, liveStreak.melhorSequencia);
        }

        const totalCorrect = trails.reduce((sum, trail) => sum + (trail.acertos ?? 0), 0);
        const totalIncorrect = trails.reduce((sum, trail) => sum + (trail.erros ?? 0), 0);
        const totalAnswers = totalCorrect + totalIncorrect;
        const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            language: user.language,
            interests: user.interests,
            onboardingCompleted: user.onboardingCompleted,
            xp: user.xp ?? 0,
            streakCurrent: user.streakCurrent ?? 0,
            streakBest: user.streakBest ?? 0,
            gamification: buildGamificationSnapshot({
                xp: user.xp ?? 0,
                streakCurrent: user.streakCurrent ?? 0,
                streakBest: user.streakBest ?? 0,
                startedTrails: trails.length,
                completedTrails: trails.filter((trail) => trail.progressoPct >= 100).length,
                accuracy,
            }),
        };
    }
}
