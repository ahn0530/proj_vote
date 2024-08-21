import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Res, Render, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParticipationService } from './participation.service';
import { BudgetItemsService } from '../budget-items/budget-items.service';
import { BudgetCategory } from '../budget-items/budget-item.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
  async renderJoin(@Req() req: Request, @Res() res: Response) {
    if (req.user) {
      return res.redirect('/participation/registration');
    }
    return res.render('participation/participation', { title: '참여하기' });
  }

  @Get('registration')
  @UseGuards(JwtAuthGuard)
  @Render('participation/registration')
  async renderRegistration(@Req() req: Request) {
    const categories = await this.budgetItemsService.getBudgetCategories();
    return { categories, user: req.user };
  }


  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitParticipation(@Req() req: Request, @Body() body: { category: BudgetCategory, percentage: number }[], @Res() res: Response) {
    const userId = req.user['id'];
    await this.participationService.submitParticipation(userId, body);
    res.redirect('/participation/registration');
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkParticipation(@Req() req: Request) {
    const userId = req.user['id'];
    return this.participationService.checkParticipation(userId);
  }
}