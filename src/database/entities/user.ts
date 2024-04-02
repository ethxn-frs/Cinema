import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { Transaction } from "./transaction"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    login: string

    @Column()
    password: string

    @CreateDateColumn({ type: "datetime" })
    createdAt: Date

    @Column()
    sold: number

    @Column()
    roles: [string]

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[]

    constructor(id: number, login: string, password: string, createdAt: Date, sold: number, roles: [string], transactions: Transaction[]) {
        this.id = id;
        this.login = login;
        this.password = password;
        this.createdAt = createdAt;
        this.sold = sold;
        this.roles = roles;
        this.transactions = transactions;
    }
}