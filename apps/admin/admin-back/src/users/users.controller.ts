import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsuarioAtual, UsuarioJwt } from '../auth/usuario-atual.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    me(@UsuarioAtual() usuario: UsuarioJwt) {
        return this.usersService.findMe(usuario.id);
    }

    @Patch('me')
    updateProfile(@UsuarioAtual() usuario: UsuarioJwt, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(usuario.id, dto);
    }

    @Patch('me/senha')
    @HttpCode(HttpStatus.NO_CONTENT)
    updatePassword(@UsuarioAtual() usuario: UsuarioJwt, @Body() dto: UpdatePasswordDto) {
        return this.usersService.updatePassword(usuario.id, dto);
    }
}
