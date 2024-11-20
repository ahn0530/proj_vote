import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Board } from './board.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.comments)
  author: User;

  @ManyToOne(() => Board, board => board.comments)
  board: Board;

  @CreateDateColumn()
  createdAt: Date;
}
