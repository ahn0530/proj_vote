import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetItemsController } from './budget-items.controller';
import { BudgetItemsService } from './budget-items.service';
import { BudgetItem } from './budget-item.entity';


@Module({
  imports: [TypeOrmModule.forFeature([BudgetItem])],
  controllers: [BudgetItemsController],
  providers: [BudgetItemsService],
  exports: [BudgetItemsService, ],
})
export class BudgetItemsModule {}