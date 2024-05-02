import express from "express";
import { AppDataSource } from "./database/database";
import { showRoutes } from "./handlers/routes/shows-route";
import { movieRoutes } from "./handlers/routes/movies-route";
import { roomRoutes } from "./handlers/routes/rooms-route";
import { ticketRoutes } from "./handlers/routes/tickets-route";
import { imageRoutes } from "./handlers/routes/images-route";
import { userRoutes } from "./handlers/routes/users-route";
import { transactionRoutes } from "./handlers/routes/transactions-route";
require('dotenv').config();
import path from "path";

const logger: any = require('./config/logger');
const cors = require('cors');


const main = async () => {
    const app = express();
    const port = 3000;

    try {
        await AppDataSource.initialize();
        console.error("well connected to database");
    } catch (error) {
        console.error("Cannot contact database");
        process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        process.exit(1); // Arrête l'application avec une erreur si JWT_SECRET n'est pas défini
    }

    app.use(cors({
        origin: 'http://localhost:3030'
    }));

    app.use('/static', express.static(path.join(__dirname, 'src', 'images')));
    app.use(express.json());

    app.use((req, res, next) => {
        res.on('finish', () => {
            const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            logger.info(`${clientIp} - ${req.method} ${req.originalUrl} ${res.statusCode} `);
        });

        next();
    });

    showRoutes(app);
    movieRoutes(app);
    ticketRoutes(app);
    roomRoutes(app);
    imageRoutes(app);
    userRoutes(app);
    transactionRoutes(app);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

main();