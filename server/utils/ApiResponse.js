export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message
    };
    if (data !== null) {
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        Object.assign(response, data);
      } else {
        response.data = data;
      }
    }
    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res, data, count, page, limit, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      count,
      page,
      limit,
      data
    });
  }

  static error(res, message = 'Server Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }

  static badRequest(res, message = 'Bad Request', errors = null) {
    return ApiResponse.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return ApiResponse.error(res, message, 403);
  }

  static notFound(res, message = 'Resource not found') {
    return ApiResponse.error(res, message, 404);
  }

  static conflict(res, message = 'Conflict') {
    return ApiResponse.error(res, message, 409);
  }
}
