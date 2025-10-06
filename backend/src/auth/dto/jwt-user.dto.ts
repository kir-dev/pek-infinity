import { IsNotEmpty } from 'class-validator';
import { User } from '@/user/entities/user.entity';

export class JwtUserDto extends User {
  @IsNotEmpty()
  iat: number;

  @IsNotEmpty()
  exp: number;
}
