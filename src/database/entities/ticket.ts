import { Collection, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Show } from "./show";
import { TicketType } from "../../enumerators/TicketType";

@Entity()
export class Ticket {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.tickets)
    user: User;

    @ManyToOne(() => Show, (show) => show.tickets)
    show: Show;

    @Column()
    type: TicketType;

    @Column()
    used: Boolean;

    constructor(id: number, user: User, show: Show, type: TicketType, used: Boolean) {

        this.id = id;
        this.user = user;
        this.show = show;
        this.type = type;
        this.used = used;
    }

}