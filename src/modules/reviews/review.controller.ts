import { Request, Response, NextFunction } from "express";
import * as reviewService from "./review.service";

export const listTopReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviews = await reviewService.listTopReviews();
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const review = await reviewService.createReview(req.user, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const review = await reviewService.updateReview(
      req.user,
      req.params.id,
      req.body,
    );
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await reviewService.deleteReview(req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listByHotel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviews = await reviewService.listByHotel(req.params.hotelId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const review = await reviewService.replyToReview(
      req.user,
      req.params.id,
      req.body.replyText,
    );
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const listMyHotelReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviews = await reviewService.listMyHotelReviews(
      (req as any).user.id,
    );
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
