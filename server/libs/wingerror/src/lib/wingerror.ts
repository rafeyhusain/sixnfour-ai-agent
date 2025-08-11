import createError = require('http-errors');
import { WingErrorDetails, WingResponse } from './contracts/wing-response';

export class WingError {
  /**
   * Helper to create a WingResponse for any HTTP status code.
   */
  private static _responseForStatus(
    status: number,
    code: string,
    message: string,
    data?: any,
    details: WingErrorDetails = {}
  ): WingResponse {
    const error = createError(status, message, { code, details });
    return WingError.isSuccess(status)
      ? WingError.success(error, data)
      : WingError.failed(error, data);
  }

  /** 200 OK: Standard response for successful HTTP requests. */
  static ok(data?: any, message = 'OK', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(200, 'OK', message, data, details);
  }

  /** 201 Created: The request has succeeded and a new resource has been created. */
  static created(data?: any, message = 'Created', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(201, 'CREATED', message, data, details);
  }

  /** 202 Accepted: The request has been accepted for processing, but the processing has not been completed. */
  static accepted(data?: any, message = 'Accepted', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(202, 'ACCEPTED', message, data, details);
  }

  /** 203 Non-Authoritative Information */
  static nonAuthoritativeInformation(data?: any, message = 'Non-Authoritative Information', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(203, 'NON_AUTHORITATIVE_INFORMATION', message, data, details);
  }

  /** 204 No Content: The server successfully processed the request, but is not returning any content. */
  static noContent(message = 'No Content', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(204, 'NO_CONTENT', message, null, details);
  }

  /** 205 Reset Content */
  static resetContent(message = 'Reset Content', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(205, 'RESET_CONTENT', message, null, details);
  }

  /** 206 Partial Content */
  static partialContent(data?: any, message = 'Partial Content', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(206, 'PARTIAL_CONTENT', message, data, details);
  }

  /** 207 Multi-Status (WebDAV) */
  static multiStatus(data?: any, message = 'Multi-Status', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(207, 'MULTI_STATUS', message, data, details);
  }

  /** 208 Already Reported (WebDAV) */
  static alreadyReported(data?: any, message = 'Already Reported', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(208, 'ALREADY_REPORTED', message, data, details);
  }

  /** 226 IM Used */
  static imUsed(data?: any, message = 'IM Used', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(226, 'IM_USED', message, data, details);
  }

  // 3xx Redirection
  /** 300 Multiple Choices */
  static multipleChoices(data?: any, message = 'Multiple Choices', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(300, 'MULTIPLE_CHOICES', message, data, details);
  }

  /** 301 Moved Permanently */
  static movedPermanently(data?: any, message = 'Moved Permanently', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(301, 'MOVED_PERMANENTLY', message, data, details);
  }

  /** 302 Found */
  static found(data?: any, message = 'Found', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(302, 'FOUND', message, data, details);
  }

  /** 303 See Other */
  static seeOther(data?: any, message = 'See Other', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(303, 'SEE_OTHER', message, data, details);
  }

  /** 304 Not Modified */
  static notModified(message = 'Not Modified', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(304, 'NOT_MODIFIED', message, null, details);
  }

  /** 305 Use Proxy */
  static useProxy(data?: any, message = 'Use Proxy', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(305, 'USE_PROXY', message, data, details);
  }

  /** 307 Temporary Redirect */
  static temporaryRedirect(data?: any, message = 'Temporary Redirect', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(307, 'TEMPORARY_REDIRECT', message, data, details);
  }

  /** 308 Permanent Redirect */
  static permanentRedirect(data?: any, message = 'Permanent Redirect', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(308, 'PERMANENT_REDIRECT', message, data, details);
  }

  // 4xx Client Error
  /** 400 Bad Request */
  static badRequest(message = 'Bad Request', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(400, 'BAD_REQUEST', message, null, details);
  }

  /** 401 Unauthorized */
  static unauthorized(message = 'Unauthorized', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(401, 'UNAUTHORIZED', message, null, details);
  }

  /** 402 Payment Required */
  static paymentRequired(message = 'Payment Required', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(402, 'PAYMENT_REQUIRED', message, null, details);
  }

  /** 403 Forbidden */
  static forbidden(message = 'Forbidden', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(403, 'FORBIDDEN', message, null, details);
  }

  /** 404 Not Found */
  static notFound(message = 'Not Found', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(404, 'NOT_FOUND', message, null, details);
  }

  /** 405 Method Not Allowed */
  static methodNotAllowed(message = 'Method Not Allowed', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(405, 'METHOD_NOT_ALLOWED', message, null, details);
  }

  /** 406 Not Acceptable */
  static notAcceptable(message = 'Not Acceptable', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(406, 'NOT_ACCEPTABLE', message, null, details);
  }

  /** 407 Proxy Authentication Required */
  static proxyAuthenticationRequired(message = 'Proxy Authentication Required', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(407, 'PROXY_AUTHENTICATION_REQUIRED', message, null, details);
  }

  /** 408 Request Timeout */
  static requestTimeout(message = 'Request Timeout', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(408, 'REQUEST_TIMEOUT', message, null, details);
  }

  /** 409 Conflict */
  static conflict(message = 'Conflict', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(409, 'CONFLICT', message, null, details);
  }

  /** 410 Gone */
  static gone(message = 'Gone', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(410, 'GONE', message, null, details);
  }

  /** 411 Length Required */
  static lengthRequired(message = 'Length Required', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(411, 'LENGTH_REQUIRED', message, null, details);
  }

  /** 412 Precondition Failed */
  static preconditionFailed(message = 'Precondition Failed', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(412, 'PRECONDITION_FAILED', message, null, details);
  }

  /** 413 Payload Too Large */
  static payloadTooLarge(message = 'Payload Too Large', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(413, 'PAYLOAD_TOO_LARGE', message, null, details);
  }

  /** 414 URI Too Long */
  static uriTooLong(message = 'URI Too Long', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(414, 'URI_TOO_LONG', message, null, details);
  }

  /** 415 Unsupported Media Type */
  static unsupportedMediaType(message = 'Unsupported Media Type', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(415, 'UNSUPPORTED_MEDIA_TYPE', message, null, details);
  }

  /** 416 Range Not Satisfiable */
  static rangeNotSatisfiable(message = 'Range Not Satisfiable', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(416, 'RANGE_NOT_SATISFIABLE', message, null, details);
  }

  /** 417 Expectation Failed */
  static expectationFailed(message = 'Expectation Failed', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(417, 'EXPECTATION_FAILED', message, null, details);
  }

  /** 422 Unprocessable Entity */
  static unprocessableEntity(message = 'Unprocessable Entity', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(422, 'UNPROCESSABLE_ENTITY', message, null, details);
  }

  /** 423 Locked */
  static locked(message = 'Locked', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(423, 'LOCKED', message, null, details);
  }

  /** 424 Failed Dependency */
  static failedDependency(message = 'Failed Dependency', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(424, 'FAILED_DEPENDENCY', message, null, details);
  }

  /** 425 Too Early */
  static tooEarly(message = 'Too Early', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(425, 'TOO_EARLY', message, null, details);
  }

  /** 426 Upgrade Required */
  static upgradeRequired(message = 'Upgrade Required', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(426, 'UPGRADE_REQUIRED', message, null, details);
  }

  /** 428 Precondition Required */
  static preconditionRequired(message = 'Precondition Required', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(428, 'PRECONDITION_REQUIRED', message, null, details);
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message = 'Too Many Requests', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(429, 'TOO_MANY_REQUESTS', message, null, details);
  }

  /** 431 Request Header Fields Too Large */
  static requestHeaderFieldsTooLarge(message = 'Request Header Fields Too Large', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(431, 'REQUEST_HEADER_FIELDS_TOO_LARGE', message, null, details);
  }

  /** 451 Unavailable For Legal Reasons */
  static unavailableForLegalReasons(message = 'Unavailable For Legal Reasons', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(451, 'UNAVAILABLE_FOR_LEGAL_REASONS', message, null, details);
  }

  // 5xx Server Error
  /** 500 Internal Server Error */
  static internalServerError(message = 'Internal Server Error', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(500, 'INTERNAL_SERVER_ERROR', message, null, details);
  }

  /** 501 Not Implemented */
  static notImplemented(message = 'Not Implemented', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(501, 'NOT_IMPLEMENTED', message, null, details);
  }

  /** 502 Bad Gateway */
  static badGateway(message = 'Bad Gateway', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(502, 'BAD_GATEWAY', message, null, details);
  }

  /** 503 Service Unavailable */
  static serviceUnavailable(message = 'Service Unavailable', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(503, 'SERVICE_UNAVAILABLE', message, null, details);
  }

  /** 504 Gateway Timeout */
  static gatewayTimeout(message = 'Gateway Timeout', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(504, 'GATEWAY_TIMEOUT', message, null, details);
  }

  /** 505 HTTP Version Not Supported */
  static httpVersionNotSupported(message = 'HTTP Version Not Supported', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(505, 'HTTP_VERSION_NOT_SUPPORTED', message, null, details);
  }

  /** 506 Variant Also Negotiates */
  static variantAlsoNegotiates(message = 'Variant Also Negotiates', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(506, 'VARIANT_ALSO_NEGOTIATES', message, null, details);
  }

  /** 507 Insufficient Storage */
  static insufficientStorage(message = 'Insufficient Storage', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(507, 'INSUFFICIENT_STORAGE', message, null, details);
  }

  /** 508 Loop Detected */
  static loopDetected(message = 'Loop Detected', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(508, 'LOOP_DETECTED', message, null, details);
  }

  /** 510 Not Extended */
  static notExtended(message = 'Not Extended', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(510, 'NOT_EXTENDED', message, null, details);
  }

  /** 511 Network Authentication Required */
  static networkAuthenticationRequired(message = 'Network Authentication Required', details: WingErrorDetails = {}): WingResponse {
    return WingError._responseForStatus(511, 'NETWORK_AUTHENTICATION_REQUIRED', message, null, details);
  }

  static throw(res: WingResponse) {
    throw createError(res.error.status, res.error.message, {
      code: res.error.code,
      details: res.error.details,
    });
  }

  // Refactored throw* methods to use the above and return WingResponse
  /** 409 Conflict (ID exists) */
  static throwConflict(id: string, details: WingErrorDetails = {}) {
    const res = WingError.conflict(`id:[${id}] already exists`, { id, ...details });
    WingError.throw(res);
  }

  /** 404 Not Found (Entity not found) */
  static throwNotFound(entity: string, details: WingErrorDetails = {}) {
    const res =  WingError.notFound(`[${entity}] not found`, { entity, ...details });
    WingError.throw(res);
  }

  /** 401 Unauthorized */
  static throwUnauthorized(message = 'Unauthorized', details: WingErrorDetails = {}) {
    const res = WingError.unauthorized(message, details);
    WingError.throw(res);
  }

  static success(err: any, data?: any): WingResponse {
    const res = WingError.response(err, data);
    res.success = true;
    return res;
  }

  static failed(err: any, data?: any): WingResponse {
    const res = WingError.response(err, data);
    res.success = false;
    return res;
  }

  static error(err: any): WingResponse {
    const res = WingError.response(err, null);
    res.success = false;
    return res;
  }

  static response(err: any, data?: any): WingResponse {
    const status = err.status || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'Unexpected error';
    const details = err.details || undefined;
    const success = WingError.isSuccess(status);

    const response: WingResponse = {
      success,
      error: { status, code, message, details },
      data,
    };
    return response;
  }
  
  static isSuccess(status: number): boolean {
    return status >= 200 && status < 300;
  }
}
