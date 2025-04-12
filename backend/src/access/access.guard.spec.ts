import AccessGuard from './access.guard';

describe('AccessGuard', () => {
  describe('Pass', () => {
    it('should be defined', () => {
      expect(AccessGuard.Pass()).toBeDefined();
    });
  });
});
