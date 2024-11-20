import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinTable, ManyToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.boards)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @OneToMany(() => Comment, comment => comment.board)
  comments: Comment[];

  @ManyToMany(() => User)
  @JoinTable()
  likedByUsers: User[];
}