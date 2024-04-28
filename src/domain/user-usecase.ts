import {DataSource} from "typeorm";
import {User} from "../database/entities/user";
import {UpdateUserRequest, UserRequest} from "../handlers/validators/user-validator";
import {hash} from "bcrypt";
import {Ticket} from "../database/entities/ticket";
import {Transaction} from "../database/entities/transaction";
import {ListTransactionFilter, TransactionUseCase} from "./transaction-usecase";
import {AppDataSource} from "../database/database";
import {TicketType} from "../enumerators/TicketType";
import {ListTicketFilter, TicketUseCase} from "./ticket-usecase";
import {ticketValidation} from "../handlers/validators/ticket-validator";
import {TransactionType} from "../enumerators/TransactionType";


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
        const ticketRepository = this.db.getRepository(Ticket);
        let transactions: Transaction[] = [];
        let tickets: Ticket[] = [];

        const newUser = new User();
        newUser.login = userData.login;
        newUser.password = await hash(userData.password, 10);
        newUser.roles = userData.roles;
        newUser.createdAt = new Date();

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

    async getUserById(userId: number): Promise<User | null> {
        const userRepository = this.db.getRepository(User);
        return await userRepository.findOne({
            where: { id: userId }
        });
    }

    async getTransactionsFromUserId(userId: number): Promise<Transaction[] | null> {
        const user = await this.getUserById(userId);
        if (!user) {
            return null;
        }

        const listTransactionFilter: ListTransactionFilter = {
            limit: 50,
            page: 1,
            userId: userId
        };

        const transactionUseCase = new TransactionUseCase(AppDataSource);
        const result = await transactionUseCase.listTransaction(listTransactionFilter);

        return result.transactions;
    }

    async getTicketsFromUserId(userId: number): Promise<Ticket[] | null> {
        const user = await this.getUserById(userId);
        if (!user) {
            return null;
        }

        const listTicketFilter: ListTicketFilter = {
            limit: 50,
            page: 1,
            userId: userId
        };

        const ticketUseCase  = new TicketUseCase(AppDataSource);;
        const result = await ticketUseCase.listTicket(listTicketFilter);

        return result.tickets;
    }

    async updateUser(userId: number, userData: UpdateUserRequest): Promise<User | Error> {
        const userRepo = this.db.getRepository(User);
        const ticketRepo = this.db.getRepository(Ticket);
        const transactionRepo = this.db.getRepository(Transaction)
        let transaction = new Transaction()

        const user = await userRepo.findOne({
            where: { id: userId },
            relations: {
                transactions: true,
                tickets: true,
            }
        })

        if (!user) {
            return new Error("User " + userId + " not found")
        }
        if (userData.login) {
            user.login = userData.login;
        }
        if (userData.password) {
            user.password = userData.password
        }
        if (userData.roles) {

            const currentRolesSet = new Set(user.roles.split(';').filter(role => role.trim()));
            const newRolesSet = new Set(userData.roles.split(';').filter(role => role.trim()));

            newRolesSet.forEach(role => {
                if (!currentRolesSet.has(role)) {
                    currentRolesSet.add(role);
                } else {
                    currentRolesSet.delete(role);
                }
            });

            user.roles = Array.from(currentRolesSet).join(';');
        }
        if (userData.sold) {
            const newSold = user.sold + userData.sold;

            if (newSold < 0) {
                throw new Error("User does not have enough sold");
            }

            user.sold = newSold;
            transaction.amount = userData.sold;
            if (userData.sold < 0){
                transaction.type = TransactionType.WITHDRAWAL
            }
            if (userData.sold > 0){
                transaction.type = TransactionType.DEPOSIT
            }
        }
        if (userData.soldTT != null) {
            user.sold = userData.soldTT
        }
        if (userData.ticketId) {
            const ticket = await ticketRepo.findOneBy({ id: userData.ticketId })

            if (!ticket) {
                throw new Error("Ticket " + userData.ticketId + " not found")
            }

            const userTickets = new Set(user.tickets);

            if (userTickets.has(ticket)) {
                userTickets.delete(ticket);
            } else {
                userTickets.add(ticket);
            }

            user.tickets = Array.from(userTickets);
        }
        if (userData.transactionId) {
            const transaction = await transactionRepo.findOneBy({ id: userData.transactionId })

            if (!transaction) {
                throw new Error("transaction " + userData.transactionId + " not found")
            }

            const userTransactions = new Set(user.transactions);

            if (userTransactions.has(transaction)) {
                userTransactions.delete(transaction);
            } else {
                userTransactions.add(transaction);
            }

            user.transactions = Array.from(userTransactions);
        }

        transaction.createdAt = new Date()
        transaction.user = user

        const result =  await userRepo.save(user);
        await transactionRepo.save(transaction);

        return result;
    }

    async createUserTicket(userId: number, ticketType: TicketType): Promise<User | Error> {

        const userRepo = this.db.getRepository(User);
        const ticketUseCase = new TicketUseCase(AppDataSource);
        const user = await userRepo.findOneBy({ id: userId });

        if (!user) {
            throw new Error("User " + userId + " not found")
        }

        let ticket: any = {
            type: ticketType,
            userId: user.id,
        }

        const sold = user.sold;

        if (!sold || sold < 10) {
            throw new Error("Not enough sold, please credit it")
        } else if (ticket.type.ticketType == TicketType.NORMAL) {
            if (sold < 10) {
                throw new Error("Not enough sold, please credit it")
            }
            user.sold -= 10
        } else if (ticket.type.ticketType == TicketType.SUPERTICKET) {
            if (sold < 90) {
                throw new Error("Not enough sold, please credit it")
            }
            user.sold -= 90
        }

        ticket.type = ticket.type.ticketType
        const ticketValidate = ticketValidation.validate(ticket)

        if (ticketValidate.error) {
            throw new Error(ticketValidate.error.message)
        }
        const ticketValue = ticketValidate.value

        await ticketUseCase.createTicket(ticketValue);

        return userRepo.save(user);
    }
}