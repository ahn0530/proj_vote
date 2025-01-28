import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { LocalSerializer } from './local.serializer';
import { LocalAuthGuard } from './local.authGuard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    //forwardRef:서비스 간 의존성 주입 
    forwardRef(() => UsersModule),
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, LocalStrategy, LocalSerializer, LocalAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}