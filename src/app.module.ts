import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { UsersModule } from './users/users.module';
import { ParticipationModule } from './participation/participation.module';
import { AuthModule } from './auth/auth.module';
import { BudgetItemsModule } from './budget-items/budget-items.module';
import { AppController } from './app.controller';
import { BoardModule } from './board/board.module';
import { BlockchainModule } from './blockchain/blockchain.module';

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
    BoardModule,
    BlockchainModule
  ],
  controllers: [AppController]
})
export class AppModule {}