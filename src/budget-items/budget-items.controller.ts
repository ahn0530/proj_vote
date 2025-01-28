import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { BudgetItemsService } from './budget-items.service';
import { BudgetCategory } from './budget-item.entity';

@Controller('budget-items')
export class BudgetItemsController {
  constructor(private readonly budgetItemsService: BudgetItemsService) {}

  @Get()
  async getAllBudgetItemsWithDescription(): Promise<Array<{ category: BudgetCategory; description: string }>> {
    return this.budgetItemsService.getAllBudgetItemsWithDescription();
  }
}