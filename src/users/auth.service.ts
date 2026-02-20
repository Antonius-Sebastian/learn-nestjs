import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    // STEP 1: See if email in used
    const existingUser = await this.usersService.find(email);

    if (existingUser.length !== 0)
      throw new BadRequestException('Email in use');

    // STEP 2: Hash the user password
    // 2.1 Generate a salt
    // Generate 16 random characters
    const salt = randomBytes(8).toString('hex');

    // 2.2 Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // 2.3 Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    // STEP 3: Create a new user and save it
    const user = await this.usersService.create(email, result);

    // STEP 4: Return the user
    return user;
  }

  async signIn(email: string, password: string) {
    // STEP 1: Make sure user with the email exists
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // STEP 2: Get the user's salt and hashed password
    const [salt, storedHash] = user.password.split('.');

    // STEP 3: Hash the inputted password with the stored salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // STEP 4: Compare the generated hash with the stored hash
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid credentials');
    }

    // STEP 5: Return the user
    return user;
  }
}
