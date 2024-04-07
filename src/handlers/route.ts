import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { AppDataSource } from "../database/database";
import { listShowsValidation } from "./validators/show-validator";
import { ShowUsecase } from "../domain/show-usecase";

export const initRoutes = (app: express.Express) => {

    /* Routes pour les Shows */

    app.get("/shows", async (req: Request, res: Response) => {
        const validation = listShowsValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listShowRequest = validation.value
        let limit = 50
        if (listShowRequest.limit) {
            limit = listShowRequest.limit
        }
        const page = listShowRequest.page ?? 1

        try {
            const showUsecase = new ShowUsecase(AppDataSource);
            const listShows = await showUsecase.listShow({ ...listShowRequest, page, limit })
            res.status(200).send(listShows)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
}