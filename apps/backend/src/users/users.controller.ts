import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service'; // Import UsersService
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto'; // Import the new DTO

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {} // Inject UsersService

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/preferences')
    async updateMyPreferences(
        @Request() req,
        @Body() updateUserPreferencesDto: UpdateUserPreferencesDto,
    ) {
        return this.usersService.updateUserPreferences(req.user.id, updateUserPreferencesDto);
    }
}
