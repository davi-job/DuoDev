import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

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

    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        const user = await this.findById(id);
        user.password = hashedPassword;
        await this.usersRepository.save(user);
    }
}
