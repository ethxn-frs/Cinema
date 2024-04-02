import Joi from "joi";
import { User } from "../../database/entities/user";
import { TransactionType } from "../../enumerators/TransactionType";

export const productValidation = Joi.object<TransactionRequest>({
    name: Joi.string()
        .min(3)
        .required(),
    user: User,
    amount: Joi.number().required(),
    type: TransactionType,
    createdAt: Joi.date().required()

}).options({ abortEarly: false })

export interface TransactionRequest {
    name: string,
    user: User;
    amount: number;
    type: TransactionType;
    createdAt: Date;
}

export const listTransactionValidation = Joi.object<ListTransactionRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListTransactionRequest {
    page?: number
    limit?: number
}

export const updateTransactionValidation = Joi.object<UpdateTransactionRequest>({
    id: Joi.number().required(),
    name: Joi.string()
        .min(3)
        .optional(),
    amount: Joi.number().optional(),
    createdAt: Joi.date().optional()

})

export interface UpdateTransactionRequest {
    id: number
    name?: string,
    amount?: number;
    createdAt?: Date;
}

export const transactionIdValidation = Joi.object<TransactionIdRequest>({
    id: Joi.number().required(),
})

export interface TransactionIdRequest {
    id: number
}
