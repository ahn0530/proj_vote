import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService{
    constructor(@InjectRepository(User) private usersRepository:Repository<User>){}

    async validateUser(email:string, password:string){
        const user=await this.usersRepository.findOne({
            where:{email},
        });
        if(!user){
            return null;
        }
        const result = await bcrypt.compare(password, user.password);
        if(result){
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

  async login(user: any) {
    const { password, ...result } = user;
    return result;
  }
}