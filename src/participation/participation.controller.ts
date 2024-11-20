import { Controller, Get, Post, Body, Param, UseGuards, Req, Res, Render, 
  NotFoundException, ConflictException, BadRequestException, Query, InternalServerErrorException } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { BudgetItemsService } from '../budget-items/budget-items.service';
import { BudgetCategory } from '../budget-items/budget-item.entity';
import { Request, Response } from 'express';
import { LocalAuthGuard } from 'src/auth/local.authGuard';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('participation')
export class ParticipationController {
  constructor(
    private readonly participationService: ParticipationService,
    private readonly budgetItemsService: BudgetItemsService,
    private readonly blockchainService: BlockchainService
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
      res.render('participation/detail', { participation, user: req.user, hasVoted });
    } catch (error) {
      res.status(404).render('error', { message: 'Participation not found' });
    }
  }

  @Get('join/detail/:id/check-wallet')
  async checkWalletVote(
    @Param('id') id: string,
    @Query('address') address: string
  ) {
    try {
      const hasVoted = await this.blockchainService.hasVoted(Number(id), address);
      return { hasVoted };
    } catch (error) {
      console.error('지갑 투표 상태 확인 중 오류:', error);
      throw new InternalServerErrorException('지갑 투표 상태를 확인하는 중 오류가 발생했습니다.');
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
  @UseGuards(LocalAuthGuard)
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
      
      // 1. DB에 참여 정보 저장
      const participation = await this.participationService.submitParticipation(userId, body);
      
      // 2. 블록체인 작업을 비동기로 처리
      this.blockchainService.createProposal(
        participation.id,
        participation.title
      ).catch(error => {
        console.error('블록체인 제안 생성 중 오류:', error);
        // 필요한 경우 여기서 추가적인 오류 처리
      });
  
      // 3. 사용자를 즉시 리다이렉트
      res.redirect('/participation/join');
    } catch (error) {
      console.error('참여 제출 중 오류 발생:', error);
      res.status(500).render('error', { message: '참여 제출 중 오류가 발생했습니다.' });
    }
  }

  @Post('join/detail/:id/vote')
  @UseGuards(LocalAuthGuard)
  async vote(
    @Param('id') id: string,
    @Req() req: any,
    @Body('userAddress') userAddress: string,
    @Res() res: Response
  ) {
    try {
      console.log('Vote request received:', {
        participationId: id,
        userId: req.user.id,
        userAddress: userAddress
      });
  
      if (!userAddress) {
        throw new BadRequestException('MetaMask 지갑 주소가 필요합니다.');
      }
  
      // 블록체인 투표
      const blockchainResult = await this.blockchainService.vote(Number(id), userAddress);
      
      // DB 투표
      await this.participationService.vote(Number(id), req.user.id);
  
      // JSON 응답 반환
      return res.json({
        success: true,
        txHash: blockchainResult.txHash,
        message: '투표가 성공적으로 처리되었습니다.'
      });
  
    } catch (error) {
      console.error('Vote error:', error);
      
      if (error instanceof ConflictException) {
        return res.status(409).json({ message: '이미 투표하셨습니다.' });
      } else if (error instanceof BadRequestException) {
        return res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundException) {
        return res.status(404).json({ message: error.message });
      } else {
        return res.status(500).json({ 
          message: '투표 처리 중 오류가 발생했습니다.',
          details: error.message 
        });
      }
    }
  }
  
  @Get('check')
  @UseGuards(LocalAuthGuard)
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