import Joi from "joi";

export const ticketValidation = Joi.object<TicketRequest>({
    name: Joi.string()
        .min(3)
        .required(),
    used: Joi.boolean().required(),
    price: Joi.number().required(),
}).options({ abortEarly: false })

export interface TicketRequest {
    name: string,
    used: Boolean;
    price: number;
}

export const listTicketValidation = Joi.object<ListTicketRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    priceMax: Joi.number().min(1).optional()
})


export interface ListTicketRequest {
    page?: number
    limit?: number
    priceMax?: number
}

export const updateTicketValidation = Joi.object<UpdateTicketRequest>({
    id: Joi.number().required(),
    used: Joi.boolean().optional(),
    price: Joi.number().min(1).optional(),
})

export interface UpdateTicketRequest {
    id: number
    used?: boolean
    price?: number
}

export const ticketIdValidation = Joi.object<TicketIdRequest>({
    id: Joi.number().required(),
})

export interface TicketIdRequest {
    id: number
}
