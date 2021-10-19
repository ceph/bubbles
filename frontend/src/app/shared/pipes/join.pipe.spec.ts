import { JoinPipe } from '~/app/shared/pipes/join.pipe';

describe('JoinPipe', () => {
  const pipe = new JoinPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transforms', () => {
    expect(pipe.transform(['x', 'y', 'z'])).toBe('x, y, z');
  });
});
