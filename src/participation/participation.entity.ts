import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';
import { BudgetCategory } from '../budget-items/budget-item.entity';

@Entity()
export class Participation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => User, user => user.participations)
  user: User;

  @Column({
    type: 'enum',
    enum: BudgetCategory
  })
  category: BudgetCategory;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  voteCount: number;

  @ManyToMany(() => User)
  @JoinTable()
  votedUsers: User[];

  @Column('text', { array: true, default: [] })
  votedWallets: string[];
}