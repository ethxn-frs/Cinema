import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { Room } from "../../database/entities/room";
import { RoomUseCase } from "../../domain/room-usecase";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { listRoomValidation, roomIdValidation, roomValidation } from "../validators/room-validator";
import { authenticateJWT, isAdmin } from '../../config/auth-middleware';

export const roomRoutes = (app: express.Express) => {

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
        const orderBy = lisRoomRequest.orderBy ?? 'id';
        const ascending = lisRoomRequest.ascending ?? true;

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
        const validationResult = roomIdValidation.validate(req.params)
        if (validationResult.error) {
            res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
            return
        }

        const roomId = validationResult.value.id
        const roomUseCase = new RoomUseCase(AppDataSource)

        try {
            const room = await roomUseCase.getRoomById(roomId);
            res.status(200).send(room)
        } catch (error) {
            res.status(500).send({ "error": "Internal error" })
        }
    })

    // delete a room by id
    app.delete("/rooms/:id", authenticateJWT, isAdmin, async (req: Request, res: Response) => {
        try {
            const validationResult = roomIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const roomId = validationResult.value;
            const roomRepository = AppDataSource.getRepository(Room);
            const room = await roomRepository.findOneBy({ id: roomId.id });
            if (room === null) {
                res.status(404).send({ error: `room ${roomId.id} not found` });
                return;
            }

            const roomDeleted = await roomRepository.remove(room);
            res.status(200).send(roomDeleted);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.post("/rooms", authenticateJWT, isAdmin, async (req: Request, res: Response) => {
        const validation = roomValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const roomRequest = validation.value;
        const roomUseCase = new RoomUseCase(AppDataSource);
        try {
            const roomCreated = await roomUseCase.createRoom(roomRequest);
            res.status(201).send(roomCreated);
        } catch (error: any) {
            res.status(500).send("Error: " + error.message);
        }
    });

    app.get("/rooms/:id/shows", async (req: Request, res: Response) => {
        const validation = roomIdValidation.validate(req.params)
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const roomIdRequest = validation.value.id
        const roomUsecase = new RoomUseCase(AppDataSource);

        try {
            const roomShows = await roomUsecase.getRoomShows(roomIdRequest);
            res.status(201).send(roomShows)
        } catch (error) {
            res.status(500).send({ error: "Interna: error" })
        }
    })
}