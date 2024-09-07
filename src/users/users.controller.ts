import { Controller, Get, Post, Body, Req, Res, UseGuards, Render, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Get('register')
  renderRegister(@Res() res: Response) {
    return res.render('users/register', { title: 'Register' });
  }

  @Get('login')
  @Render('users/login')
  getLogin() {
    return { title: 'Login' };
  }
  
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.usersService.create(createUserDto);
      req.login(user, (err) => {
        if (err) {
          res.redirect('/users/register');
        } else {
          res.redirect('/participation/index');
        }
      });
    } catch (error) {
      res.redirect('/users/register');
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: any, @Res() res: Response, @Body('returnTo') returnTo?: string) {
    try {
      if (!req.user) {
        return res.redirect('/users/login');
      }
      
      return new Promise<void>((resolve) => 
        req.login(req.user, (err) => {
          if (err) {
            console.error('Login error:', err);
            res.redirect('/users/login');
          } else {
            const redirectUrl = returnTo ? decodeURIComponent(returnTo) : '/participation/index';
            res.redirect(redirectUrl);
          }
          resolve();
        })
      );
    } catch (error) {
      console.error('Unexpected error during login:', error);
      res.status(500).json({ message: 'An unexpected error occurred during login' });
    }
  }


  @Get('logout')
  logout(@Req() req: any, @Res() res: Response) {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/participation/index');
    });
  }
}