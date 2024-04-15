import Joi, { number } from "joi";
import { Transaction } from "../../database/entities/transaction";
import { Ticket } from "../../database/entities/ticket";

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
    login: Joi.string()
        .min(5)
        .required(),
    password: Joi.string().min(8).required(),
    createdAt: Joi.date().required(),
    sold: Joi.number().min(0).required(),
    roles: Joi.array().required(),
    transactions: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        amount: Joi.number().required(),
    })).required(),
    tickets: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        event: Joi.string().required(),
    })).required(),
}).options({ abortEarly: false })


export interface createUserRequest{
    login: string,
    password: string,
    sold: number,
}

export const creatUser = Joi.object<createUserRequest>({
    login: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
    sold: Joi.number().min(0).required(),  
})

export interface LoginUser {
    login: string,
    password: string,
}

export const LoginUserValidation = Joi.object<LoginUser>({
    login: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
})


/*export interface TransactionValidator{
    findAll(): any;
    id: number,
    transactions: [],
    roles: string
}

export const ListUserTransactionValidator =Joi.object<TransactionValidator>({
    id: Joi.number(),
    transactions: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        amount: Joi.number().required(),
    })).required(),
    roles: Joi.string()
})*/

//view solde

export interface showUserSold{
    id: number,
    sold: number,
}

export const showUserSoldValidatort = Joi.object<showUserSold>({
    id : Joi.number(),
    sold: Joi.number().min(0).required(),
})

//view transaction
export interface UserTransation{
    id: number,
    transactions: [],
    roles: string,
}

export const UserTransationListValidatort = Joi.object<UserTransation>({
    id : Joi.number(),
    transactions: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        amount: Joi.number().required(),
    })).required(),
    roles: Joi.array().required(),
})

//view ticket
export interface UserTicket{
    id: number,
    tickets: [],
    roles: string,
}

export const UserTicketListValidatort = Joi.object<UserTicket>({
    id : Joi.number(),
    tickets: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        event: Joi.string().required(),
    })).required(),
    roles: Joi.array().required(),
})




