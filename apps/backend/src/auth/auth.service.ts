import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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
        // Ensure user exists and has a password before comparing
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
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

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Se estiver atualizando email, verifica se já existe
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const emailExists = await this.usersService.findByEmail(updateProfileDto.email);
            if (emailExists) {
                throw new ConflictException('Este email já está em uso');
            }
        }

        // Atualiza e retorna o usuário sem a senha
        const updatedUser = await this.usersService.update(userId, updateProfileDto);
        const { password, ...result } = updatedUser;
        return result;
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
}
