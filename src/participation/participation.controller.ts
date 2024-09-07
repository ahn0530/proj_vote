import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Res, Render, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import { ParticipationService } from './participation.service';
import { BudgetItemsService } from '../budget-items/budget-items.service';
import { BudgetCategory } from '../budget-items/budget-item.entity';
import { Request, Response } from 'express';
import { User } from 'src/users/user.entity';

@Controller('participation')
export class ParticipationController {
  constructor(
    private readonly participationService: ParticipationService,
    private readonly budgetItemsService: BudgetItemsService
  ) {}

  @Get('index')
  @Render('participation/index')
  async renderBudgetList() {
    try {
      const budgetItems = await this.budgetItemsService.getAllBudgetItemsWithDescription();
      return { budgetItems };
    } catch (error) {
      console.error('예산 목록을 가져오는 중 오류 발생:', error);
      return { error: '예산 목록을 불러오는 중 오류가 발생했습니다.' };
    }
  }

  @Get('join')
  @Render('participation/join')
  async renderJoin() {
    try {
      const participations = await this.participationService.getAllParticipations();
      return { participations };
    } catch (error) {
      return { participations: [], error: '참여 목록을 가져오는 중 오류가 발생했습니다.' };
    }
  }

  @Get('join/detail/:id')
  async renderDetail(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      const participation = await this.participationService.getParticipationById(Number(id));
      const hasVoted = req.user ? await this.participationService.hasUserVoted(Number(id), req.user.id) : false;
      if (!participation) {
        throw new NotFoundException('Participation not found');
      }
      res.render('participation/detail', { participation,user: req.user, hasVoted });
    } catch (error) {
      res.status(404).render('error', { message: 'Participation not found' });
    }
  }

  @Post('join/detail/:id/vote')
  @UseGuards(SessionAuthGuard)
  async vote(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      await this.participationService.vote(Number(id), req.user.id);
      res.redirect(`/participation/join/detail/${id}`);
    } catch (error) {
      if (error instanceof ConflictException) {
        res.status(400).render('error', { message: 'You have already voted' });
      } else {
        res.status(500).render('error', { message: 'An error occurred while voting' });
      }
    }
  }

  @Get('registration')
  async renderRegistration(@Req() req: Request, @Res() res: Response) {
    if (!req.isAuthenticated()) {
      const returnTo = encodeURIComponent(req.originalUrl);
      return res.redirect(`/users/login?returnTo=${returnTo}`);
    }

    const categories = await this.budgetItemsService.getBudgetCategories();
    return res.render('participation/registration', { 
      categories, 
      user: req.user,
      isAuthenticated: true
    });
  }
  
  @Post('submit')
  @UseGuards(SessionAuthGuard)
  async submitParticipation(
    @Req() req: Request, 
    @Body() body: {
      title: string;
      description: string;
      category: BudgetCategory;
    }, 
    @Res() res: Response
  ) {
    try {
      const userId = req.user['id'];
      await this.participationService.submitParticipation(userId, body);
      res.redirect('/participation/join');
    } catch (error) {
      console.error('참여 제출 중 오류 발생:', error);
      res.status(500).json({ error: '참여 제출 중 오류가 발생했습니다.' });
    }
  }
  
  @Get('check')
  @UseGuards(AuthGuard('session'))
  async checkParticipation(@Req() req: Request) {
    try {
      const userId = req.user['id'];
      return await this.participationService.checkParticipation(userId);
    } catch (error) {
      console.error('참여 확인 중 오류 발생:', error);
      throw new NotFoundException('참여 정보를 찾을 수 없습니다.');
    }
  }
}