import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    const userCount = 0;

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const createdUser = { id: userCount + 1, email, password } as User;
        users.push(createdUser);
        return Promise.resolve(createdUser);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user and hash password', async () => {
    const user = await service.signUp('admin@example.com', 'admin123');

    expect(user.password).not.toEqual('admin123');

    const [salt, password] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(password).toBeDefined();
  });

  it('should throw an error if user signs up with an email that is in used', async () => {
    await service.signUp('admin@example.com', 'admin123');

    await expect(
      service.signUp('admin@example.com', 'admin123'),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw an error if user signs in with an email that doesn't exists", async () => {
    await service.signUp('admin@example.com', 'admin123');

    await expect(
      service.signIn('notfound@example.com', 'admin123'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if user signs in with invalid password', async () => {
    await service.signUp('admin@example.com', 'admin123');

    await expect(
      service.signIn('admin@example.com', 'invalid123'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should sign in with correct credentials', async () => {
    await service.signUp('admin@example.com', 'admin123');

    const user = await service.signIn('admin@example.com', 'admin123');
    expect(user).toBeDefined();
  });
});
