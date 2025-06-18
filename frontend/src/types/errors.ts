/**
 * ApiError class for handling API errors
 * 
 * @example
 * const error = new ApiError('API error', 500);
 * console.log(error.message); // 'API error'
 * console.log(error.status); // 500
 */
class ApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

export { ApiError };