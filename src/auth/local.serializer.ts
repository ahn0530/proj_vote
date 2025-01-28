import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";

@Injectable()
export class LocalSerializer extends PassportSerializer {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    serializeUser(user: any, done: Function) { //done은 콜백 함수로, passport가 세션 처리를 위해 사용
        done(null, user.id); // 세션에 id 저장 완료 알림
    }    

    async deserializeUser(userId: number, done: Function) {
        try {
            const user = await this.usersService.findById(userId);
            done(null, user);// 사용자 정보 복원 완료 알림
        } catch (error) {
            done(error);
        }
    }
}