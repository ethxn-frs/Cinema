import Joi, { number } from "joi";

export interface UserRequest {
    login: string,
    password: string,
    createdAt: Date,
    sold: number,
    roles: string,
    transactions: [],
    tickets: [],
}

export const userValidation = Joi.object<UserRequest>({
    login: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
    createdAt: Joi.date().required(),
    sold: Joi.number().min(0).required(),
    roles: Joi.array().required(),
    transactions: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        amount: Joi.number().required(),
    })),
    tickets: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        event: Joi.string().required(),
    })),
}).options({ abortEarly: false })


export const listUserValidation = Joi.object<ListUserRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListUserRequest {
    page?: number
    limit?: number
}

export interface UserValidationRequest {
    login: string,
    password: string,
    roles: string,
    sold: number,
}
export const UserValidationRequest = Joi.object<UserValidationRequest>({
    login: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
    roles: Joi.string().required(),
    sold: Joi.number().min(0).required(),
})


export const showUserSoldValidatort = Joi.object<showUserSold>({
    id: Joi.number().required(),
    sold: Joi.number().min(0),
})

export interface showUserSold {
    id: number,
    sold: number,
}

export const UserIdValidator = Joi.object<UserIdValidatior>({
    id: Joi.number().required(),
})

export interface UserIdValidatior {
    id: number,
}

export interface createUserRequest {
    login: string,
    password: string,
    sold: number,
    roles: string
}

export const creatUser = Joi.object<createUserRequest>({
    login: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
    sold: Joi.number().min(0).required(),
    roles: Joi.string().required()
})


export interface LoginUser {
    login: string,
    password: string,
}

export const LoginUserValidation = Joi.object<LoginUser>({
    login: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
})

export interface userUpDateSolde {
    sold: number
}

export const userUpDateSolde = Joi.object<userUpDateSolde>({
    sold: Joi.number().min(0).required(),
})