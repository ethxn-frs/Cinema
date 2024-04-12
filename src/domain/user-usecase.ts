import { DataSource } from "typeorm";
import { User } from "../database/entities/user";


export interface ListUserCase {
    limit: number;
    page: number;
}

export class ListUsecase {
    constructor(private readonly db: DataSource) { }

    async listUser(lisuser: ListUserCase): Promise<{ user: User[], total: number }> {

        console.log(lisuser)
        //const query = this.db.createQueryBuilder(User, 'user');
        // Create a query builder instance for User
        const query = this.db.getRepository(User).createQueryBuilder('user');


        query.skip((lisuser.page - 1) * lisuser.limit);
        query.take(lisuser.limit);

        const [user, total] = await query.getManyAndCount();
        return {
            user,
            total
        };
    }
}