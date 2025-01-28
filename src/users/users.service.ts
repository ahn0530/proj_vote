import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne(username);
  }

  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findById(id);
  }
}