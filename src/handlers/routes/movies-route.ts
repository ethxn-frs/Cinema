import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { Movie } from "../../database/entities/movie";
import { MovieUseCase } from "../../domain/movie-usecase";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { listMovieValidation, movieIdValidation, movieValidation } from "../validators/movie-validator";

export const movieRoutes = (app: express.Express) => {

    //get all movies
    app.get("/movies", async (req: Request, res: Response) => {
        const validation = listMovieValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        const listMovieRequest = validation.value

        let limit = 50
        if (listMovieRequest.limit) {
            limit = listMovieRequest.limit
        }
        const page = listMovieRequest.page ?? 1
        try {
            const movieUseCase = new MovieUseCase(AppDataSource)
            const listMovies = await movieUseCase.listMovie({ ...listMovieRequest, page, limit })
            res.status(200).send(listMovies)
        }
        catch (error) {
            res.status(500).send({ error: "Internal error" })
        }

    })

    //get a movie by id
    app.get("/movies/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = movieIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }

            const movieId = validationResult.value.id
            const movieUseCase = new MovieUseCase(AppDataSource)
            const movie = await movieUseCase.getMovieById(movieId);

            if (movie === null) {
                res.status(404).send({ "error": `error movie ${movieId} not found` })
                return
            }
            res.status(200).send(movie)
        }
        catch (error) {
            res.status(500).send({ "error": "Internal error" })
        }
    })

    // delete a movie by id
    app.delete("/movies/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = movieIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const movieId = validationResult.value

            const movieRepository = AppDataSource.getRepository(Movie)
            const movie = await movieRepository.findOneBy({ id: movieId.id })
            if (movie === null) {
                res.status(404).send({ "error": `movie ${movieId.id} not found` })
                return
            }

            const movieDeleted = await movieRepository.remove(movie)
            res.status(200).send(movieDeleted)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/movies", async (req: Request, res: Response) => {
        const validation = movieValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const movieRequest = validation.value
        const movieUseCase = new MovieUseCase(AppDataSource)
        try {
            const movieCreated = await movieUseCase.createMovie(
                movieRequest
            )
            res.status(201).send(movieCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })

}