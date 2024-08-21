import { Controller, Get, Post, Body, Req, Res, UseGuards, Render } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Get('register')
  renderRegister(@Res() res: Response) {
    return res.render('users/register', { title: 'Register' });
  }
  
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Req() req: any, @Res() res: Response) {
    try {
      const user = await this.usersService.create(createUserDto);
      const { access_token } = await this.authService.login(user);
      req.session.jwt = access_token;
      req.flash('success', 'Successfully registered and logged in!');
      res.redirect('/participation/index');
    } catch (error) {
      req.flash('error', 'Registration failed. Please try again.');
      res.redirect('/users/register');
    }
  }

  @Get('login')
  @Render('users/login')
  getLogin() {
    return { title: 'Login' };
  }


  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    req.session.jwt = result.access_token;
    req.session.user = result.user; 
    req.flash('success', 'Successfully logged in!');
    const returnTo = req.body.returnTo || '/participation/index';
    res.redirect(returnTo);
  }

  @Get('logout')
  logout(@Req() req: any, @Res() res: Response) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  }
}