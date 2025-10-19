import { beforeEach, describe, expect, it } from 'vitest';
import { MembershipService } from './membership.service';

describe('MembershipService', () => {
  let service: MembershipService;

  beforeEach(() => {
    service = new MembershipService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
