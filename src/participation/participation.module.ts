import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { Participation } from './participation.entity';
import { User } from '../users/user.entity';
import { BudgetItemsModule } from '../budget-items/budget-items.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participation, User]),
    BudgetItemsModule,
    BlockchainModule,
  ],
  controllers: [ParticipationController],
  providers: [ParticipationService],
  exports: [ParticipationService],
})
export class ParticipationModule {}