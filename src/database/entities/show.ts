import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room";
import { Movie } from "./movie";
import { ShowState } from "../../enumerators/ShowState";
import { Ticket } from "./ticket";

@Entity()
export class Show {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Room, (roomShow) => roomShow.shows)
    room!: Room;

    @OneToOne(() => Movie, (movie) => movie.show)
    @JoinColumn()
    movie!: Movie;

    @CreateDateColumn({ type: "datetime" })
    startAt!: Date;

    @CreateDateColumn({ type: "datetime" })
    endAt!: Date;

    @Column()
    state!: ShowState;

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    tickets!: Ticket[];

    constructor(id?: number, room?: Room, movie?: Movie, startAt?: Date, endAt?: Date, state?: ShowState, tickets?: Ticket[]) {
        if (id) this.id = id;
        if (room) this.room = room;
        if (movie) this.movie = movie;
        if (startAt) this.startAt = startAt;
        if (endAt) this.endAt = endAt;
        if (state) this.state = state;
        if (tickets) this.tickets = tickets;
    }
}