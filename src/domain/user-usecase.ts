import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { UserRequest } from "../handlers/validators/user-validator";
import { hash } from "bcrypt";
import { Ticket } from "../database/entities/ticket";
import { Transaction } from "../database/entities/transaction";


export interface ListUserCase {
    limit: number;
    page: number;
}

export class UserUseCase {
    constructor(private readonly db: DataSource) { }

    async listUser(lisuser: ListUserCase): Promise<{ user: User[], total: number }> {

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

    async createUser(userData: UserRequest): Promise<User | Error> {

        const userRepository = this.db.getRepository(User);
        const transactionRepository = this.db.getRepository(Transaction);
        const ticketRepository = this.db.getRepository(Ticket)
        let transactions: Transaction[] = [];
        let tickets: Ticket[] = [];

        const newUser = new User();
        newUser.login = userData.login;
        newUser.password = await hash(userData.password, 10);
        newUser.roles = userData.roles;

        if (userData.sold != null) {
            newUser.sold = userData.sold;
        } else {
            newUser.sold = 0;
        }

        if (userData.transactionId != null) {
            userData.transactionId.forEach(
                async x => {
                    if (transactionRepository.findOne({ where: { id: x } }) != null) {
                        const transactionTemp = await transactionRepository.findOne({ where: { id: x } });
                        if (transactionTemp != null) {
                            transactions.push(transactionTemp);
                        }
                    }
                }
            )
        }
        newUser.transactions = transactions;

        if (userData.ticketId != null) {
            userData.ticketId.forEach(
                async x => {
                    if (ticketRepository.findOne({ where: { id: x } }) != null) {
                        const ticketTemp = await ticketRepository.findOne({ where: { id: x } });
                        if (ticketTemp != null) {
                            tickets.push(ticketTemp);
                        }
                    }
                }
            )
        }
        newUser.tickets = tickets;
        return userRepository.save(newUser);
    }
}