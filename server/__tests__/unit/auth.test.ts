import type { Request, Response, NextFunction } from 'express';
import { requireMetricsToken } from '../../src/middleware/auth';

function mockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireMetricsToken', () => {
  const expectedToken = 'test-metrics-token-1234567890abcdef';
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  it('rejects when Authorization header is missing', () => {
    const req = { headers: {} } as unknown as Request;
    const res = mockRes();
    requireMetricsToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when scheme is not Bearer', () => {
    const req = { headers: { authorization: `Basic ${expectedToken}` } } as unknown as Request;
    const res = mockRes();
    requireMetricsToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when token length differs', () => {
    const req = { headers: { authorization: 'Bearer short' } } as unknown as Request;
    const res = mockRes();
    requireMetricsToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when token value differs (same length)', () => {
    const wrong = 'a'.repeat(expectedToken.length);
    const req = { headers: { authorization: `Bearer ${wrong}` } } as unknown as Request;
    const res = mockRes();
    requireMetricsToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts a matching Bearer token', () => {
    const req = {
      headers: { authorization: `Bearer ${expectedToken}` },
    } as unknown as Request;
    const res = mockRes();
    requireMetricsToken(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
