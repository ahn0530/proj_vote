import { Controller, Get, Post, Body, Req, Res, UseGuards, Render, Inject, forwardRef, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';
import { LocalAuthGuard } from 'src/auth/local.authGuard';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
 constructor(
   private readonly usersService: UsersService,
 ) {}

 @Get('register')
 renderRegister(@Res() res: Response) {
   return res.render('users/register', { title: 'Register' });
 }

 @Get('login')
 @Render('users/login')
 getLogin(@Query('returnTo') returnTo?: string) {
   return { title: 'Login', returnTo };
 }
 
 @Post('register')
 async register(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
   try {
     const user = await this.usersService.create(createUserDto);
     await this.loginAfterRegister(req, user);
     res.redirect('/participation/index');
   } catch (error) {
     res.redirect('/users/register');
   }
 }

 @UseGuards(LocalAuthGuard)
 @Post('login')
 async login(@Req() req: any, @Res() res: Response, @Body('returnTo') returnTo?: string) {
   try {
     if (!req.user) {
       return res.redirect('/users/login');
     }
     const redirectUrl = returnTo ? decodeURIComponent(returnTo) : '/participation/index';
     return res.redirect(redirectUrl);
   } catch (error) {
     console.error('Login error:', error);
     return res.redirect('/users/login');
   }
 }

 @Get('logout')
 logout(@Req() req: any, @Res() res: Response) {
   req.session.destroy((err) => {
     if (err) console.error('Logout error:', err);
     res.clearCookie('connect.sid');
     res.redirect('/');
   });
 }

 private async loginAfterRegister(req: Request, user: User): Promise<void> {
   return new Promise((resolve, reject) => {
     req.login(user, (err) => err ? reject(err) : resolve());
   });
 }
}