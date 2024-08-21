import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email: string;

  @IsString()
  @MinLength(4, { message: '사용자명은 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자명은 최대 20자까지 가능합니다.' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '사용자명은 알파벳, 숫자, 밑줄, 대시만 포함할 수 있습니다.' })
  username: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자까지 가능합니다.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: '비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'
  })
  password: string;
}