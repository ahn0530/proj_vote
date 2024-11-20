import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find({ relations: ['author'], order: { createdAt: 'DESC' } });
  }


  async create(title: string, content: string, author: User): Promise<Board> {
    const board = this.boardRepository.create({ title, content, author });
    return this.boardRepository.save(board);
  }

  async update(id: number, title: string, content: string, userId: number): Promise<Board> {
    const board = await this.findOne(id);
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    if (board.author.id !== userId) {
      throw new UnauthorizedException('게시글을 수정할 권한이 없습니다.');
    }
    board.title = title;
    board.content = content;
    return this.boardRepository.save(board);
  }

  async remove(id: number, userId: number): Promise<void> {
    const board = await this.findOne(id);
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    if (board.author.id !== userId) {
      throw new UnauthorizedException('게시글을 삭제할 권한이 없습니다.');
    }
    await this.boardRepository.remove(board);
  }

  async findOne(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
    });
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    board.viewCount += 1;
    await this.boardRepository.save(board);
    return board;
  }

  async addComment(boardId: number, content: string, user: User): Promise<Comment> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }
    const comment = this.commentRepository.create({
      content,
      author: user,
      board,
    });
    return this.commentRepository.save(comment);
  }

  async updateComment(boardId: number, commentId: number, content: string, userId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, board: { id: boardId } },
      relations: ['author']
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.author.id !== userId) {
      throw new UnauthorizedException('댓글을 수정할 권한이 없습니다.');
    }

    comment.content = content;
    return this.commentRepository.save(comment);
  }

  async deleteComment(boardId: number, commentId: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, board: { id: boardId } },
      relations: ['author']
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.author.id !== userId) {
      throw new UnauthorizedException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.commentRepository.remove(comment);
  }

  async toggleLike(id: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['likedByUsers']
    });
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
  
    const userLikeIndex = board.likedByUsers.findIndex(user => user.id === userId);
    
    if (userLikeIndex > -1) {
      // 이미 좋아요를 눌렀다면 취소
      board.likedByUsers.splice(userLikeIndex, 1);
      board.likeCount = Math.max(0, board.likeCount - 1);  // 0 미만으로 떨어지지 않도록 함
    } else {
      // 좋아요를 누르지 않았다면 추가
      board.likedByUsers.push({ id: userId } as User);
      board.likeCount++;
    }
  
    await this.boardRepository.save(board);
    return { liked: userLikeIndex === -1, likeCount: board.likeCount };
  }
}