import Joi from "joi";
import { ShowState } from "../../enumerators/ShowState";

export const showValidation = Joi.object<ShowRequest>({
    roomId: Joi.number().min(1).required(),
    movieId: Joi.number().min(1).required(),
    startAt: Joi.date().required(),
    state: Joi.string().valid(ShowState.ACTIVE, ShowState.CANCELED),
}).options({ abortEarly: false })

export interface ShowRequest {
    roomId: number,
    movieId: number
    startAt: Date
    state: ShowState,
}

export const listShowsValidation = Joi.object<ListShowRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListShowRequest {
    page?: number
    limit?: number
}

export const updateShowValidation = Joi.object<UpdateShowRequest>({
    id: Joi.number().required(),
    name: Joi.string().min(3).optional(),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional()
})

export interface UpdateShowRequest {
    id: number,
    name?: string,
    startAt?: Date,
    endAt?: Date,
}

export const showIdValidation = Joi.object<ShowIdRequest>({
    id: Joi.number().required(),
})

export interface ShowIdRequest {
    id: number
}
