import Joi from "joi";
import { Transaction } from "../../database/entities/transaction";
import { Ticket } from "../../database/entities/ticket";

export const userValidation = Joi.object<UserRequest>({
    login: Joi.string()
        .min(5)
        .required(),
    password: Joi.string().min(8).required(),
    createdAt: Joi.date().required(),
    sold: Joi.number().min(0).required(),
    roles: Joi.array().required(),
    transactions: Joi.array().required(),
    tickets: Joi.array().required(),
}).options({ abortEarly: false })

export interface UserRequest {
    login: string,
    password: string,
    createdAt: Date,
    sold: number,
    roles: [string],
    transactions: [Transaction],
    tickets: [Ticket],
}

export const listUserValidation = Joi.object<ListUserRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListUserRequest {
    page?: number
    limit?: number
}

export const updateUserValidation = Joi.object<UpdateUserRequest>({
    id: Joi.number().required(),
    login: Joi.string()
        .min(5)
        .optional(),
    password: Joi.string().min(8).optional(),
    sold: Joi.number().min(0).optional(),
    roles: Joi.array().optional(),
    transactions: Joi.array().optional(),
    tickets: Joi.array().optional(),
})

export interface UpdateUserRequest {
    id: number
    login?: string,
    password?: string,
    sold?: number,
    roles?: [string],
    transactions?: [Transaction],
    tickets?: [Ticket],
}

export const userIdValidation = Joi.object<UserIdRequest>({
    id: Joi.number().required(),
})

export interface UserIdRequest {
    id: number
}
