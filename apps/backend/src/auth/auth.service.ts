import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { MailerService } from '@nestjs-modules/mailer';

// Armazena { code, expiresAt, registerData }
const pendingRegistrations = new Map<
    string,
    {
        code: string;
        expiresAt: Date;
        data: RegisterUserDto;
    }
>();

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ) {}
    
    async register(registerUserDto: RegisterUserDto): Promise<{ message: string }> {
        const existingUser = await this.usersService.findOneByEmail(registerUserDto.email);
        if (existingUser) {
            throw new BadRequestException('Usuário com esse email já existe!');
        }

        const code = crypto.randomInt(1000, 9999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        pendingRegistrations.set(registerUserDto.email, {
            code,
            expiresAt,
            data: registerUserDto,
        });

        await this.mailerService.sendMail({
            to: registerUserDto.email,
            subject: 'Código de verificação',
            text: `Seu código de verificação é: ${code}. Ele expira em 10 minutos.`,
        });

        return { message: 'Código enviado para o e-mail' };
    }
    
    async verifyCode(verifyCodeDto: VerifyCodeDto) {
        const pending = pendingRegistrations.get(verifyCodeDto.email);

        if (!pending) {
            throw new BadRequestException('Nenhum cadastro pendente para esse e-mail');
        }
        if (new Date() > pending.expiresAt) {
            pendingRegistrations.delete(verifyCodeDto.email);
            throw new BadRequestException('Código expirado. Faça o cadastro novamente.');
        }
        if (pending.code !== verifyCodeDto.code) {
            throw new BadRequestException('Código inválido');
        }
        
        const hashedPassword = await bcrypt.hash(pending.data.password, 10);
        const user = await this.usersService.create({
            ...pending.data,
            password: hashedPassword,
        });

        pendingRegistrations.delete(verifyCodeDto.email);

        const { password, ...result } = user;
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: result,
        };
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas!');
        }
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}
