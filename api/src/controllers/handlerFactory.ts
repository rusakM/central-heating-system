import { NextFunction, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import APIFeatures from "../utils/apiFeatures";
import { IRequest } from "../utils/globalTypes";

const checkUserRestriction = async (
    message: string,
    Model: any,
    req: IRequest,
    next: NextFunction
) => {
    const d = await Model.findById(req.params.id);

    if (!d) {
        return next(new AppError("Nie znaleziono w bazie danych", 404));
    }

    if (req.user && req.user.role === "użytkownik") {
        if (!d.user) {
            return;
        }

        if (`${d.user._id}` !== `${req.user.id}`) {
            return next(new AppError(message, 403));
        }
    }
};

export function deleteOne(Model: any) {
    return catchAsync(
        async (req: IRequest, res: Response, next: NextFunction) => {
            await checkUserRestriction(
                "Nie możesz skasować zasobów do których nie masz dostępu",
                Model,
                req,
                next
            );
            const doc = await Model.findByIdAndDelete(req.params.id);

            if (!doc) {
                return next(
                    new AppError("No document found with that ID", 404)
                );
            }

            res.status(204).json({
                status: "success",
                data: null,
            });
        }
    );
}

export function updateOne(Model: any) {
    return catchAsync(
        async (req: IRequest, res: Response, next: NextFunction) => {
            await checkUserRestriction(
                "Nie możesz zmienić zasobów do których nie masz dostępu",
                Model,
                req,
                next
            );
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });

            if (!doc) {
                return next(
                    new AppError("No document found with that ID", 404)
                );
            }

            res.status(200).json({
                status: "success",
                data: {
                    data: doc,
                },
            });
        }
    );
}

export function createOne(Model: any) {
    return catchAsync(
        async (req: IRequest, res: Response, next: NextFunction) => {
            const newDoc = await Model.create(req.body);

            res.status(201).json({
                status: "success",
                data: {
                    data: newDoc,
                },
            });
        }
    );
}

export function getOne(Model: any, popOptions: any = {}) {
    return catchAsync(
        async (req: IRequest, res: Response, next: NextFunction) => {
            await checkUserRestriction(
                "Nie możesz pobrać zasobów do których nie masz dostępu",
                Model,
                req,
                next
            );
            const query = await Model.findById(req.params.id);
            if (popOptions) {
                query.populate(popOptions);
            }
            const doc = await query;
            if (!doc) {
                return new AppError("No document with that ID", 404);
            }

            res.status(200).json({
                status: "success",
                data: {
                    data: doc,
                },
            });
        }
    );
}

export function getAll(Model: any) {
    return catchAsync(
        async (req: IRequest, res: Response, next: NextFunction) => {
            if (req.user && req.user.role === "użytkownik") {
                req.query.user = req.user.id;
            }
            const features = new APIFeatures(Model.find({}), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();
            const docs = await features.query;

            res.status(200).json({
                status: "success",
                results: docs.length,
                data: {
                    data: docs,
                },
            });
        }
    );
}
