
import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        //ExecutionContext로부터 요청을 가져온 뒤 이 요청 정보를 바탕으로 로그인을 실행할 수 있도록 하는 것이다.
        //이 localAuthGuard가 실행되고 나면 local.strategy.ts가 실행된다.
        // 이미 인증된 사용자인 경우 true 반환
        if (request.isAuthenticated()) {
            return true;
        }

        try {
            const result = await super.canActivate(context); //부모 클래스(AuthGuard)의 인증 로직 실행
            await super.logIn(request); //인증 성공 시 세션에 로그인 상태 저장
            return result as boolean;
        } catch (error) {
            console.error('LocalAuthGuard error:', error);
            throw new UnauthorizedException('Authentication failed');
        }
    }
}