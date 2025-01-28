import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participation } from './participation.entity';
import { User } from '../users/user.entity';
import { BudgetCategory } from '../budget-items/budget-item.entity';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async submitParticipation(userId: number, participationData: {
    title: string,
    description: string,
    category: BudgetCategory
  }): Promise<Participation> {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const participation = this.participationRepository.create({
    user,
    title: participationData.title,
    description: participationData.description,
    category: participationData.category,
    imageUrl: 'https://example.com/default-image.jpg'
  });
  return this.participationRepository.save(participation);
  }

  async getAllParticipations(): Promise<Participation[]> {
    return this.participationRepository.find({
    relations: ['user', 'votedUsers'],
    order: { createdAt: 'DESC' }
    });
  }

  async getParticipationById(id: number): Promise<Participation> {
    const participation = await this.participationRepository.findOne({
      where: { id },
      relations: ['user', 'votedUsers'],
    });
    if (!participation) throw new NotFoundException(`Participation not found`);
    return participation;
  }

  async checkParticipation(userId: number): Promise<{ participated: boolean; participationId?: number }> {
    const participation = await this.participationRepository.findOne({ where: { user: { id: userId } } });
    if (participation) {
      return { participated: true, participationId: participation.id };
    }
    return { participated: false };
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