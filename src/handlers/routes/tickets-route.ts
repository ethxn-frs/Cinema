import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { Ticket } from "../../database/entities/ticket";
import { TicketUseCase } from "../../domain/ticket-usecase";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { listTicketValidation, ticketIdValidation, ticketValidation } from "../validators/ticket-validator";

export const ticketRoutes = (app: express.Express) => {

    //get all tickets
    app.get("/tickets", async (req: Request, res: Response) => {
        const validation = listTicketValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
        }
        const listTicketsRequest = validation.value

        let limit = 50
        if (listTicketsRequest.limit)
            limit = listTicketsRequest.limit

        const page = listTicketsRequest.page ?? 1

        try {
            const ticketUseCase = new TicketUseCase(AppDataSource)
            const listTicket = await ticketUseCase.listTicket({ ...listTicketsRequest, page, limit })
            res.status(200).send(listTicket)
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    //get a ticket by id
    app.get("/tickets/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = ticketIdValidation.validate(req.params)
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }

            const ticketID = validationResult.value
            const ticketRepository = AppDataSource.getRepository(Ticket)
            const ticket = await ticketRepository.findOneBy({ id: ticketID.id })

            if (ticket === null) {
                res.status(404).send({ "error": `ticket ${ticketID.id} not found` })
                return
            }

            res.status(200).send(ticket)
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ "error": "Internal error" })
        }


    })

    // delete a ticket by id
    app.delete("/tickets/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = ticketIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const ticketId = validationResult.value

            const ticketRepository = AppDataSource.getRepository(Ticket)
            const ticket = await ticketRepository.findOneBy({ id: ticketId.id })
            if (ticket === null) {
                res.status(404).send({ "error": `ticket ${ticketId.id} not found` })
                return
            }

            const ticketDeleted = await ticketRepository.remove(ticket)
            res.status(200).send(ticketDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/tickets", async (req: Request, res: Response) => {
        const validation = ticketValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const ticketRequest = validation.value
        const ticketRepo = AppDataSource.getRepository(Ticket)
        try {
            const ticketCreated = await ticketRepo.save(
                ticketRequest
            )
            res.status(201).send(ticketCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })
}