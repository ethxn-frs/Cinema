import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { AppDataSource } from "../database/database";
import { User } from "../database/entities/user";

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        // @ts-ignore
        jwt.verify(token, process.env.JWT_SECRET as string, (err: VerifyErrors | null, user: object | undefined) => {
            if (err) {
                return res.sendStatus(403);
            }

            // @ts-ignore
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.user.id;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });

    if (user && user.roles.split(';').map(role => role.trim()).includes("admin")) {
        next();
    } else {
        res.status(403).send({ error: "Forbidden" });
    }
};

export { authenticateJWT, isAdmin };
