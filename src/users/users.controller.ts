import { Controller, Get, Post, Body, Req, Res, UseGuards, Render, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';
import { LocalAuthGuard } from 'src/auth/local.authGuard';

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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any, @Res() res: Response, @Body('returnTo') returnTo?: string) {
      try {
          if (!req.user) {
              return res.redirect('/users/login?error=Invalid credentials');
          }
          
          await new Promise<void>((resolve, reject) => 
              req.login(req.user, (err) => {
                  if (err) {
                      reject(err);
                  } else {
                      resolve();
                  }
              })
          );
          
          const redirectUrl = returnTo ? decodeURIComponent(returnTo) : '/participation/index';
          return res.redirect(redirectUrl);
      } catch (error) {
          console.error('Login error:', error);
          return res.redirect('/users/login?error=Login failed');
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