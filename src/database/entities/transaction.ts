import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { TransactionType } from "../../enumerators/TransactionType";

@Entity()
export class Transaction {


    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (userTransaction) => userTransaction.transactions)
    user: User;

    @Column()
    amount: number;

    @Column()
    type: TransactionType

    @CreateDateColumn({ type: "datetime" })
    createdAt: Date

    constructor(id: number, user: User, amount: number, type: TransactionType, createdAt: Date) {
        this.id = id;
        this.user = user;
        this.amount = amount;
        this.type = type;
        this.createdAt = createdAt;
    }

}