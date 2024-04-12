import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { AppDataSource } from "../database/database";
import { listShowsValidation, showIdValidation, showValidation } from "./validators/show-validator";
import { ShowUsecase } from "../domain/show-usecase";
import { listMovieValidation, movieIdValidation, movieValidation } from "./validators/movie-validator";
import { listTicketValidation, ticketIdValidation, ticketValidation } from "./validators/ticket-validator";
import { listRoomValidation, roomIdValidation, roomValidation } from "./validators/room-validator";
import { MovieUseCase } from "../domain/movie-usecase";
import { TicketUseCase } from "../domain/ticket-usecase";
import { RoomUseCase } from "../domain/room-usecase";
import { Show } from "../database/entities/show";
import { Movie } from "../database/entities/movie";
import { Ticket } from "../database/entities/ticket";
import { Room } from "../database/entities/room";
import { upload } from "../config/multerConfig"
import { Image } from "../database/entities/image"

export const initRoutes = (app: express.Express) => {


    /* Routes pour les Shows */


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

    /* Routes pour les Movies */


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
            console.log(error)
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
            const movieId = validationResult.value
            const movieRepository = AppDataSource.getRepository(Movie)
            const movie = await movieRepository.findOneBy({ id: movieId.id })

            if (movie === null) {
                res.status(404).send({ "error": `error movie ${movieId.id} not found` })
                return
            }

            res.status(200).send(movie)
        }
        catch (error) {
            console.log(error)
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
            console.log(error)
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
        const movieRepo = AppDataSource.getRepository(Movie)
        try {
            const movieCreated = await movieRepo.save(
                movieRequest
            )
            res.status(201).send(movieCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })


    /* Routes pour les Tickets */


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


    /* Routes pour les Rooms */


    //get all rooms
    app.get("/rooms", async (req: Request, res: Response) => {
        const validation = listRoomValidation.validate(req.query)

        if (validation.error)
            res.status(400).send(generateValidationErrorMessage(validation.error.details))

        const lisRoomRequest = validation.value

        let limit = 50
        if (lisRoomRequest.limit)
            limit = lisRoomRequest.limit

        const page = lisRoomRequest.page ?? 1

        try {
            const roomUseCase = new RoomUseCase(AppDataSource)
            const listRoom = await roomUseCase.listRoom({ ...lisRoomRequest, page, limit })
            res.status(200).send(listRoom)
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    //get a room by id
    app.get("/rooms/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = roomIdValidation.validate(req.params)
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }

            const roomId = validationResult.value
            const roomRepoistory = AppDataSource.getRepository(Room)
            const room = roomRepoistory.findOneBy({ id: roomId.id })

            if (room === null) {
                res.status(404).send({ "error": `error room ${roomId.id} not found` })
                return
            }

            res.status(200).send(room)
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ "error": "Internal error" })
        }
    })

    // delete a room by id
    app.delete("/rooms/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = roomIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const roomId = validationResult.value

            const roomRepository = AppDataSource.getRepository(Room)
            const room = await roomRepository.findOneBy({ id: roomId.id })
            if (room === null) {
                res.status(404).send({ "error": `room ${roomId.id} not found` })
                return
            }

            const roomDeleted = await roomRepository.remove(room)
            res.status(200).send(roomDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/rooms", async (req: Request, res: Response) => {
        const validation = roomValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const roomRequest = validation.value
        const roomRepo = AppDataSource.getRepository(Room)
        try {
            const roomCreated = await roomRepo.save(
                roomRequest
            )
            res.status(201).send(roomCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post('/images', upload.single('image'), async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).send("File upload failed.");
        }

        try {
            const imageRepository = AppDataSource.getRepository(Image);

            const newImage = new Image();
            newImage.name = req.file.filename;
            newImage.path = req.file.path;
            newImage.type = req.file.mimetype;

            // Sauvegarder l'image
            const savedImage = await imageRepository.save(newImage);
            res.status(201).send({
                message: "File uploaded and Image saved successfully",
                imageData: savedImage
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

}