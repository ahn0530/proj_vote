import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './board.entity';
import {Comment } from './comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Comment])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}