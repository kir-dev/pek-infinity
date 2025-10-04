import { Module } from '@nestjs/common';
import { GroupModule } from './group/group.module';
import { MembershipModule } from './membership/membership.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, GroupModule, MembershipModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
