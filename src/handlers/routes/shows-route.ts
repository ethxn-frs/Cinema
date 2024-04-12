import express, { Request, Response } from "express";
import { ShowUsecase } from "../../domain/show-usecase";
import { AppDataSource } from "../../database/database";
import { showValidation, showIdValidation, listShowsValidation } from "../validators/show-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { Show } from "../../database/entities/show";

export const showRoutes = (app: express.Express) => {

    // get all shows
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

    //get a show by id
    app.get("/shows/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = showIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const showId = validationResult.value.id;
            const showUsecase = new ShowUsecase(AppDataSource);
            const show = await showUsecase.getShowById(showId);

            if (show === null) {
                res.status(404).send({ "error": `Show ${showId} not found` });
                return;
            }
            res.status(200).send(show);
        } catch (error) {
            console.log(error);
            res.status(500).send({ "error": "Internal error" });
        }
    });


    // delete a show by id
    app.delete("/shows/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = showIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const showId = validationResult.value

            const showRepository = AppDataSource.getRepository(Show)
            const show = await showRepository.findOneBy({ id: showId.id })
            if (show === null) {
                res.status(404).send({ "error": `show ${showId.id} not found` })
                return
            }

            const showDeleted = await showRepository.remove(show)
            res.status(200).send(showDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/shows", async (req: Request, res: Response) => {
        const validation = showValidation.validate(req.body);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const showRequest = validation.value;
        const showUsecase = new ShowUsecase(AppDataSource);

        try {
            const result = await showUsecase.createShow(showRequest);

            if (result instanceof Error) {
                res.status(400).send({ "error": result.message });
                return;
            }

            res.status(201).send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
}