import express from "express";
import { AppDataSource } from "./database/database";
import { showRoutes } from "./handlers/routes/shows-route";
import { movieRoutes } from "./handlers/routes/movies-route";
import { roomRoutes } from "./handlers/routes/rooms-route";
import { ticketRoutes } from "./handlers/routes/tickets-route";
import { imageRoutes } from "./handlers/routes/images-route";


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

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

main();
