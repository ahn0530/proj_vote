import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { UsersModule } from './users/users.module';
import { ParticipationModule } from './participation/participation.module';
import { AuthModule } from './auth/auth.module';
import { BudgetItemsModule } from './budget-items/budget-items.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    ParticipationModule,
    AuthModule,
    BudgetItemsModule,
  ],
  controllers: [AppController]
})
export class AppModule {}