import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './users.entity';
import { AuthGuard } from '../guards/auth.guard';

@Serialize(UserDto)
@Controller('auth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  @Post('signUp')
  async createUser(
    @Body() body: CreateUserDto,
    @Session() session: { sub: number | null },
  ) {
    const user = await this.authService.signUp(body.email, body.password);
    session.sub = user.id;
    return user;
  }

  @Post('signIn')
  async signIn(
    @Body() body: CreateUserDto,
    @Session() session: { sub: number | null },
  ) {
    const user = await this.authService.signIn(body.email, body.password);
    session.sub = user.id;
    return user;
  }

  @Post('signOut')
  signOut(@Session() session: { sub: number | null }) {
    session.sub = null;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Get(':id')
  async findUser(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new Error('user id is not correct');
    }

    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new Error('user id is not correct');
    }

    return this.usersService.update(userId, body);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new Error('user id is not correct');
    }

    return this.usersService.remove(userId);
  }
}
