import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room";
import { Movie } from "./movie";
import { ShowState } from "../../enumerators/ShowState";
import { Ticket } from "./ticket";

@Entity()
export class Show {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Room, (room) => room.shows)
    room!: Room;

    @OneToOne(() => Movie, (movie) => movie.shows)
    @JoinColumn()
    movie!: Movie;

    @CreateDateColumn({ type: "datetime" })
    startAt!: Date;

    @CreateDateColumn({ type: "datetime" })
    endAt!: Date;

    @Column()
    state!: ShowState;

    @ManyToMany(() => Ticket, ticket => ticket.shows)
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