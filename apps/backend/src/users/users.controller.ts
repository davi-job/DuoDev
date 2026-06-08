import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('leaderboard/weekly')
    getWeeklyLeaderboard(@Request() req) {
        return this.usersService.getWeeklyLeaderboard(req.user.id);
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
