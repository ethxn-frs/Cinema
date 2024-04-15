import express, { Request, Response } from "express";
import { upload } from "../../config/multerConfig";
import { AppDataSource } from "../../database/database";
import { Image } from "../../database/entities/image"

export const imageRoutes = (app: express.Express) => {

    app.get('/images', async (req: Request, res: Response) => {
        try {
            const imageRepository = AppDataSource.getRepository(Image);
            const images = await imageRepository.find();

            res.status(200).send({
                message: "Images fetched successfully",
                imageData: images
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Internal error" });
        }
    });


    app.get('/images/:id', async (req: Request, res: Response) => {
        try {
            const imageId = req.params.id; // Récupérer l'ID de l'image depuis l'URL
            const imageRepository = AppDataSource.getRepository(Image);
            const image = await imageRepository.findOneBy({ id: imageId });

            if (!image) {
                return res.status(404).send({ message: "Image not found" });
            }

            res.status(200).send({
                message: "Image fetched successfully",
                imageData: image
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Internal error" });
        }
    });


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