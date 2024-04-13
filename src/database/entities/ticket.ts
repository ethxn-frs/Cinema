import { Collection, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Show } from "./show";
import { TicketType } from "../../enumerators/TicketType";
import { number } from "joi";

@Entity()
export class Ticket {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.tickets)
    user!: User;

    @ManyToOne(() => Show, (show) => show.tickets)
    show!: Show;

    @Column()
    type!: TicketType;

    @Column()
    used!: Boolean;

    @Column()
    price!: number;

    constructor(id?: number, user?: User, show?: Show, type?: TicketType, used?: Boolean, price?: number) {

        if (id) this.id = id;
        if (user) this.user = user;
        if (show) this.show = show;
        if (type) this.type = type;
        if (used) this.used = used;
        if (price) this.price = price;
    }

}