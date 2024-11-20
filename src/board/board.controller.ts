import { Controller, Get, Post, Put, Delete, Body, Param, Render, Redirect, UseGuards, Req, NotFoundException, UnauthorizedException, InternalServerErrorException, Res } from '@nestjs/common';
import { BoardService } from './board.service';
import { LocalAuthGuard } from 'src/auth/local.authGuard';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('index')
  @Render('board/index')
  async findAll() {
    const boards = await this.boardService.findAll();
    return { boards };
  }

  @Get('create')
  @UseGuards(LocalAuthGuard)
  @Render('board/create')
  createForm() {
    return {};
  }

  @Post()
  @UseGuards(LocalAuthGuard)
  @Redirect('board/index')
  async create(@Body() boardData: { title: string; content: string }, @Req() req) {
    await this.boardService.create(boardData.title, boardData.content, req.user);
  }

  @Get(':id')
  @Render('board/show')
  async findOne(@Param('id') id: string) {
    try {
      const board = await this.boardService.findOne(+id);
      // 댓글을 최신순으로 정렬
      board.comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      return { board };
    } catch (error) {
      console.error('Error in findOne:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }
      throw new InternalServerErrorException('서버 오류가 발생했습니다.');
    }
  }

  @Get(':id/edit')
  @UseGuards(LocalAuthGuard)
  @Render('board/edit')
  async editForm(@Param('id') id: string, @Req() req) {
    const board = await this.boardService.findOne(+id);
    if (board.author.id !== req.user.id) {
      throw new UnauthorizedException('게시글을 수정할 권한이 없습니다.');
    }
    return { board };
  }

  @Put(':id')
  @UseGuards(LocalAuthGuard)
  async update(@Param('id') id: string, @Body() boardData: { title: string; content: string }, @Req() req) {
    try {
      const updatedBoard = await this.boardService.update(+id, boardData.title, boardData.content, req.user.id);
      return { message: '게시글이 성공적으로 수정되었습니다.', board: updatedBoard };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('게시글 수정 중 오류가 발생했습니다.');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('게시글을 삭제할 권한이 없습니다.');
    }
    try {
      await this.boardService.remove(+id, req.user.id);
      return { message: '게시글이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('게시글 삭제 중 오류가 발생했습니다.');
    }
  }


  @Post(':id/comment')
  async addComment(@Param('id') id: string, @Body('content') content: string, @Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('댓글을 작성하려면 로그인이 필요합니다.');
    }
    const comment = await this.boardService.addComment(+id, content, req.user);
    return comment;
  }
  @Put(':id/comment/:commentId')
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body('content') content: string,
    @Req() req
  ) {
    if (!req.user) {
      throw new UnauthorizedException('댓글을 수정하려면 로그인이 필요합니다.');
    }
    try {
      const updatedComment = await this.boardService.updateComment(+id, +commentId, content, req.user.id);
      return updatedComment;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // throw new InternalServerErrorException('댓글 수정 중 오류가 발생했습니다.');
    }
  }

  @Delete(':id/comment/:commentId')
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Req() req
  ) {
    if (!req.user) {
      throw new UnauthorizedException('댓글을 삭제하려면 로그인이 필요합니다.');
    }
    try {
      await this.boardService.deleteComment(+id, +commentId, req.user.id);
      return { message: '댓글이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('댓글 삭제 중 오류가 발생했습니다.');
    }
  }
  
  @Put(':id/like')
  async toggleLike(@Param('id') id: string, @Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('좋아요 기능을 사용하려면 로그인이 필요합니다.');
    }
    try {
      const result = await this.boardService.toggleLike(+id, req.user.id);
      return result;
    } catch (error) {
      console.error('Toggle like error:', error);
      throw new InternalServerErrorException('An error occurred while toggling like');
    }
  }
}