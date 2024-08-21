import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get()
  @Render('home')
  getHome(@Req() req: Request) {
    return { 
      title: 'Home',
      user: req['user']
    };
  }
}