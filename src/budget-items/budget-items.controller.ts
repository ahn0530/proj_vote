import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { BudgetItemsService } from './budget-items.service';
import { BudgetCategory, BudgetItem } from './budget-item.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('budget-items')
export class BudgetItemsController {
  constructor(private readonly budgetItemsService: BudgetItemsService) {}

  @Get()
  async getAllBudgetItemsWithDescription(): Promise<Array<BudgetItem & { description: string }>> {
    return this.budgetItemsService.getAllBudgetItemsWithDescription();
  }
  @Put(':category')
  @UseGuards(AuthGuard('jwt'))
  async updateBudgetItem(
    @Param('category') category: BudgetCategory
  ): Promise<BudgetItem> {
    return this.budgetItemsService.updateBudgetItem(category);
  }
}