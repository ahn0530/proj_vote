import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (err || !user) {
      if (!response.headersSent) {
        request.flash('error', '로그인이 필요합니다.');
        response.redirect('/users/login?returnTo=' + encodeURIComponent(request.originalUrl));
      }
      return false;
    }
    return user;
  }
}