import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export function sendCreated<T>(res: Response, data: T, message = "Created successfully") {
  return sendSuccess(res, data, message, 201);
}
