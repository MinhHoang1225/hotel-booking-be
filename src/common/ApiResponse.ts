export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data?: T;
  public timestamp: string;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = "Success"): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message = "Error", data?: any): ApiResponse<null> {
    return new ApiResponse(false, message, data);
  }
}