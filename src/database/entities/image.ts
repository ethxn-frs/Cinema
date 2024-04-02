import { Column, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Movie } from "./movie";


@Entity()
export class Image {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        unique: true
    })
    name: string

    @OneToOne(() => Movie, (movie) => movie.image)
    movie: Movie

    @Column()
    path: string;

    @Column()
    type: string;

    constructor(id: string, name: string, movie: Movie, path: string, type: string) {
        this.id = id;
        this.name = name;
        this.movie = movie;
        this.path = path;
        this.type = type;
    }

}