import { WingError } from './wingerror';

describe('WingError', () => {
  describe('alreadyExists', () => {
    it('should throw a 409 error with ID_EXISTS code and details', () => {
      const id = '123';
      const details = { foo: 'bar' };
      try {
        WingError.alreadyExists(id, details);
      } catch (err: any) {
        expect(err.status).toBe(409);
        expect(err.code).toBe('ID_EXISTS');
        expect(err.message).toBe(`id:[${id}] already exists`);
        expect(err.details).toEqual({ id, ...details });
      }
    });
  });

  describe('notFound', () => {
    it('should throw a 404 error with NOT_FOUND code and details', () => {
      const entity = 'User';
      const details = { foo: 'bar' };
      try {
        WingError.notFound(entity, details);
      } catch (err: any) {
        expect(err.status).toBe(404);
        expect(err.code).toBe('NOT_FOUND');
        expect(err.message).toBe(`[${entity}] not found`);
        expect(err.details).toEqual({ entity, ...details });
      }
    });
  });

  describe('badRequest', () => {
    it('should throw a 400 error with BAD_REQUEST code and details', () => {
      const message = 'Invalid input';
      const code = 'CUSTOM_CODE';
      const details = { foo: 'bar' };
      try {
        WingError.badRequest(message, code, details);
      } catch (err: any) {
        expect(err.status).toBe(400);
        expect(err.code).toBe(code);
        expect(err.message).toBe(message);
        expect(err.details).toEqual(details);
      }
    });
  });

  describe('unauthorized', () => {
    it('should throw a 401 error with UNAUTHORIZED code and details', () => {
      const message = 'No access';
      const details = { foo: 'bar' };
      try {
        WingError.unauthorized(message, details);
      } catch (err: any) {
        expect(err.status).toBe(401);
        expect(err.code).toBe('UNAUTHORIZED');
        expect(err.message).toBe(message);
        expect(err.details).toEqual(details);
      }
    });
  });

  describe('internalError', () => {
    it('should throw a 500 error with INTERNAL_SERVER_ERROR code and details', () => {
      const message = 'Oops';
      const details = { foo: 'bar' };
      try {
        WingError.internalError(message, details);
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.code).toBe('INTERNAL_SERVER_ERROR');
        expect(err.message).toBe(message);
        expect(err.details).toEqual(details);
      }
    });
  });

  describe('ok', () => {
    it('should return a 200 error-like object with OK code and details', () => {
      const message = 'All good';
      const details = { foo: 'bar' };
      const result = WingError.ok(message, details);
      expect(result.status).toBe(200);
      expect(result.code).toBe('OK');
      expect(result.message).toBe(message);
      expect(result.details).toEqual(details);
    });
  });

  describe('created', () => {
    it('should return a 201 error-like object with CREATED code and details', () => {
      const message = 'Resource created';
      const details = { foo: 'bar' };
      const result = WingError.created(message, details);
      expect(result.status).toBe(201);
      expect(result.code).toBe('CREATED');
      expect(result.message).toBe(message);
      expect(result.details).toEqual(details);
    });
  });

  describe('noContent', () => {
    it('should return a 204 error-like object with NO_CONTENT code and details', () => {
      const message = 'Nothing here';
      const details = { foo: 'bar' };
      const result = WingError.noContent(message, details);
      expect(result.status).toBe(204);
      expect(result.code).toBe('NO_CONTENT');
      expect(result.message).toBe(message);
      expect(result.details).toEqual(details);
    });
  });

  describe('response', () => {
    it('should format a successful response', () => {
      const data = { foo: 'bar' };
      const err = { status: 200, code: 'OK', message: 'Success', details: { a: 1 } };
      const result = WingError.response(data, err);
      expect(result).toEqual({
        success: true,
        error: { code: 'OK', message: 'Success', details: { a: 1 } },
        data,
      });
    });
    it('should format an error response with defaults', () => {
      const data = null;
      const err = {};
      const result = WingError.response(data, err);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error.message).toBe('Unexpected error');
      expect(result.data).toBeNull();
    });
  });

  describe('isSuccess', () => {
    it('should return true for 2xx status codes', () => {
      expect(WingError.isSuccess(200)).toBe(true);
      expect(WingError.isSuccess(201)).toBe(true);
      expect(WingError.isSuccess(299)).toBe(true);
    });
    it('should return false for non-2xx status codes', () => {
      expect(WingError.isSuccess(199)).toBe(false);
      expect(WingError.isSuccess(300)).toBe(false);
      expect(WingError.isSuccess(404)).toBe(false);
    });
  });
});
