import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../src/middleware/validateRequest';

function mockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('validateRequest', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  it('passes when query matches schema (with coercion)', () => {
    const schema = z.object({ limit: z.coerce.number().int().positive() });
    const req = { query: { limit: '10' } } as unknown as Request;
    const res = mockRes();
    validateRequest({ query: schema })(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as unknown as { query: { limit: number } }).query.limit).toBe(10);
  });

  it('returns 400 with validation issues on bad body', () => {
    const schema = z.object({ name: z.string().min(3) });
    const req = { body: { name: 'x' } } as unknown as Request;
    const res = mockRes();
    validateRequest({ body: schema })(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'validation_error', target: 'body' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('skips validation for fields not provided in targets', () => {
    const req = { body: { foo: 'bar' }, query: {}, params: {} } as unknown as Request;
    const res = mockRes();
    validateRequest({})(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
