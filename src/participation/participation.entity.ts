import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { BudgetItem } from '../budget-items/budget-item.entity';

@Entity()
export class Participation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.participations)
  user: User;

  @OneToMany(() => BudgetItem, budgetItem => budgetItem.participation, { cascade: true })
  budgets: BudgetItem[];

  @CreateDateColumn()
  createdAt: Date;
}