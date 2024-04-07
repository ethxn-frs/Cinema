import Joi from "joi";
import { Movie } from "../../database/entities/movie";
import { Room } from "../../database/entities/room";
import { Ticket } from "../../database/entities/ticket";
import { ShowState } from "../../enumerators/ShowState";

export const showValidation = Joi.object<ShowRequest>({
    name: Joi.string()
        .min(3)
        .required(),
    room: Room,
    movie: Movie,
    startAt: Joi.date().required(),
    endAt: Joi.date().required(),
    state: ShowState,
    tickets: [Ticket],
}).options({ abortEarly: false })

export interface ShowRequest {
    name: string,
    room: Room,
    movie: Movie,
    startAt: Date
    endAt: Date
    state: ShowState,
    tickets: [Ticket],
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
