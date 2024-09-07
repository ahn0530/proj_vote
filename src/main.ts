import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import ejsMate = require('ejs-mate');
import session = require('express-session');
import flash = require('connect-flash');
import passport = require('passport');
import { HttpException, HttpStatus } from '@nestjs/common';
declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // View engine setup
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('ejs', ejsMate);
  app.setViewEngine('ejs');

  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your_session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      }
    })
  );

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  
  // Locals middleware
  app.use((req: any, res: any, next) => {
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
  });



  // Global exception filter
  app.useGlobalFilters({
    catch(exception: unknown, host: import("@nestjs/common").ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      if (response.headersSent) {
        console.warn('Headers already sent. Unable to send error response.');
        return;
      }

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        message = exception.message;
      }

      if (status === HttpStatus.UNAUTHORIZED) {
        request.flash('error', '로그인이 필요합니다.');
        const returnTo = encodeURIComponent(request.originalUrl || request.url);
        return response.redirect(`/users/login?returnTo=${returnTo}`);
      } else {
        response.status(status).json({
          statusCode: status,
          message: message,
        });
      }
    }
  });

  await app.listen(3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();