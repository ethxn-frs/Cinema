import express from "express";
import { AppDataSource } from "./database/database";
import { showRoutes } from "./handlers/routes/shows-route";
import { movieRoutes } from "./handlers/routes/movies-route";
import { roomRoutes } from "./handlers/routes/rooms-route";
import { ticketRoutes } from "./handlers/routes/tickets-route";
import { imageRoutes } from "./handlers/routes/images-route";
import { userRoutes } from "./handlers/routes/users-route";
import { Express } from "express-serve-static-core";
import { transactionRoutes } from "./handlers/routes/transactions-route";


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

    app.use(express.json());

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