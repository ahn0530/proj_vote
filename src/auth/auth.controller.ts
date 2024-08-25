import { Controller, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body('returnTo') returnTo?: string) {
    try {
      if (!req.user) {
        return res.redirect('/users/login');
      }

      const result = await this.authService.login(req.user);
      req.session.user = result.user;
      
      if (returnTo) {
        return res.redirect(decodeURIComponent(returnTo));
      }
      return res.redirect('/participation/index');
    } catch (error) {
      console.error('Login error:', error);
      return res.redirect('/users/login');
    }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  }
}