import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participation } from './participation.entity';
import { User } from '../users/user.entity';
import { BudgetItemsService } from '../budget-items/budget-items.service';
import { BudgetCategory } from '../budget-items/budget-item.entity';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private budgetItemsService: BudgetItemsService
  ) {}

  async submitParticipation(userId: number, budgetData: { category: BudgetCategory; percentage: number }[]): Promise<Participation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const participation = this.participationRepository.create({ user });
    await this.participationRepository.save(participation);

    for (const item of budgetData) {
      await this.budgetItemsService.updateBudgetItem(item.category);
    }

    const updatedBudgetItems = await this.budgetItemsService.getAllBudgetItems();
    participation.budgets = updatedBudgetItems;
    await this.participationRepository.save(participation);

    return participation;
  }

  async checkParticipation(userId: number): Promise<{ participated: boolean; participationId?: number }> {
    const participation = await this.participationRepository.findOne({ where: { user: { id: userId } } });
    if (participation) {
      return { participated: true, participationId: participation.id };
    }
    return { participated: false };
  }
}