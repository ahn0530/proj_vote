import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.repository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.repository.findOne({ where: { id } });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async remove(user: User): Promise<User> {
    return this.repository.remove(user);
  }
}