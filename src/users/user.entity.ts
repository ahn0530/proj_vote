import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Participation } from '../participation/participation.entity';
import { Board } from '../board/board.entity';
import { Comment } from '../board/comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Participation, participation => participation.user)
  participations: Participation[];

  @OneToMany(() => Board, board => board.author)
  boards: Board[];
  
  @OneToMany(() => Comment, comment => comment.board)
  comments: any;
}
