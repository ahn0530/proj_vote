import { Controller, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './local.authGuard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request, @Res() res: Response, @Body('returnTo') returnTo?: string) {
    try {
      if (!req.user) {
        console.error('Login failed: No user object');
        return res.redirect('/users/login?error=Invalid credentials');
      }

      const result = await this.authService.login(req.user);
      req.user = result;
      
      if (returnTo) {
        return res.redirect(decodeURIComponent(returnTo));
      }
      return res.redirect('/participation/index');
    } catch (error) {
      console.error('Login error:', error);
      return res.redirect('/users/login?error=Login failed');
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