import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room";
import { Movie } from "./movie";
import { ShowState } from "../../enumerators/ShowState";
import { Ticket } from "./ticket";

@Entity()
export class Show {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Room, (roomShow) => roomShow.shows)
    room: Room;

    @OneToOne(() => Movie, (movie) => movie.show)
    movie: Movie;

    @CreateDateColumn({ type: "datetime" })
    startAt: Date

    @CreateDateColumn({ type: "datetime" })
    endAt: Date

    @Column()
    state: ShowState;

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    tickets: Ticket[];

    constructor(id: number, room: Room, movie: Movie, startAt: Date, endAt: Date, state: ShowState, tickets: Ticket[]) {

        this.id = id;
        this.room = room;
        this.movie = movie;
        this.startAt = startAt;
        this.endAt = endAt;
        this.state = state;
        this.tickets = tickets;
    }

}