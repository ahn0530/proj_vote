import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user.id);
  }

  async deserializeUser(userId: number, done: (err: Error, payload: any) => void): Promise<any> {
    try {
      const user = await this.usersService.findById(userId);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}