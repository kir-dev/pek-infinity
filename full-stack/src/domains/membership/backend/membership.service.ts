import 'reflect-metadata';
import { injectable } from 'tsyringe';

// biome-ignore lint/complexity/noBannedTypes: -
type CreateMembershipDto = {};

interface UpdateMembershipDto extends Partial<CreateMembershipDto> {}

@injectable()
export class MembershipService {
  create(_createMembershipDto: CreateMembershipDto) {
    return 'This action adds a new membership';
  }

  findAll() {
    return `This action returns all membership`;
  }

  findOne(id: number) {
    return `This action returns a #${id} membership`;
  }

  update(id: number, _updateMembershipDto: UpdateMembershipDto) {
    return `This action updates a #${id} membership`;
  }

  remove(id: number) {
    return `This action removes a #${id} membership`;
  }
}
