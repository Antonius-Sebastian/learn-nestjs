import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const users: User[] = [
      { id: 1, email: 'admin@example.com', password: 'admin123' } as User,
      { id: 2, email: 'user@example.com', password: 'user123' } as User,
    ];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      findOne: (id: number) => {
        const filteredUser = users.find((user) => user.id === id) ?? null;
        return Promise.resolve(filteredUser);
      },
      update: (id: number, attrs: Partial<User>) => {
        const userIndex = users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
          throw new NotFoundException('user not found');
        }

        users[userIndex] = { ...users[userIndex], ...attrs } as User;

        return Promise.resolve(users[userIndex]);
      },
      remove: (id: number) => {
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) {
          throw new NotFoundException('user not found');
        }
        const user = users[userIndex];

        users.splice(userIndex, 1);

        return Promise.resolve(user);
      },
    };

    fakeAuthService = {
      signIn: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
      // signUp: (email: string, password: string) => {}
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers should return a list of users with the given email', async () => {
    const users = await controller.findAllUsers('admin@example.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('admin@example.com');
  });

  it('findUser should returns a single user with given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
  });

  it('findUser should throws not found exception with invalid id ', async () => {
    await expect(controller.findUser('1000')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('signIn should update session object and return user', async () => {
    const session = { sub: null };
    const user = await controller.signIn(
      {
        email: 'admin@example.com',
        password: 'admin123',
      },
      session,
    );

    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
    expect(session.sub).toEqual(1);
  });
});
