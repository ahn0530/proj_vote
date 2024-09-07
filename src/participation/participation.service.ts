import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participation } from './participation.entity';
import { User } from '../users/user.entity';
import { BudgetItemsService } from '../budget-items/budget-items.service';
import { BudgetCategory } from '../budget-items/budget-item.entity';

@Injectable()
export class ParticipationService {
  private readonly logger = new Logger(ParticipationService.name);

  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private budgetItemsService: BudgetItemsService
  ) {}

  async submitParticipation(userId: number, participationData: {
    title: string,
    description: string,
    category: BudgetCategory
  }): Promise<Participation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const participation = this.participationRepository.create({
      user,
      title: participationData.title,
      description: participationData.description,
      imageUrl: 'https://example.com/default-image.jpg' // 기본 이미지 URL
    });
    await this.participationRepository.save(participation);

    await this.budgetItemsService.createBudgetItem(participationData.category, participation.id);

    return this.participationRepository.findOne({ 
      where: { id: participation.id },
      relations: ['user', 'budgets']
    });
  }

  async getAllParticipations(): Promise<Participation[]> {
    try {
      const participations = await this.participationRepository.find({
        relations: ['user', 'budgets'],
        order: { createdAt: 'DESC' }
      });
      this.logger.log(`Retrieved ${participations.length} participations`);
      return participations;
    } catch (error) {
      this.logger.error(`Error retrieving participations: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkParticipation(userId: number): Promise<{ participated: boolean; participationId?: number }> {
    const participation = await this.participationRepository.findOne({ where: { user: { id: userId } } });
    if (participation) {
      return { participated: true, participationId: participation.id };
    }
    return { participated: false };
  }

  async getParticipationById(id: number): Promise<Participation> {
    const participation = await this.participationRepository.findOne({
      where: { id },
      relations: ['user', 'budgets','votedUsers'],
    });
    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }
    return participation;
  }

  async vote(participationId: number, userId: number): Promise<Participation> {
    const participation = await this.participationRepository.findOne({
      where: { id: participationId },
      relations: ['votedUsers']
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    const hasVoted = participation.votedUsers.some(user => user.id === userId);
    if (hasVoted) {
      throw new ConflictException('User has already voted');
    }

    participation.voteCount += 1;
    participation.votedUsers.push({ id: userId } as User);

    return this.participationRepository.save(participation);
  }

  async hasUserVoted(participationId: number, userId: number): Promise<boolean> {
    const participation = await this.participationRepository.findOne({
      where: { id: participationId },
      relations: ['votedUsers']
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    return participation.votedUsers.some(user => user.id === userId);
  }
}