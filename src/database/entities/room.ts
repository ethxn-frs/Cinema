import { Column, OneToOne } from "typeorm"
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn"
import { Entity } from "typeorm/decorator/entity/Entity"
import { Show } from "./show"
//import { faDharmachakra } from "@fortawesome/free-solid-svg-icons"


@Entity()
export class Room {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    name: string

    @Column()
    description: string

    @Column()
    type: string

    @Column()
    state: boolean

    @Column()
    handicapAvailable: boolean

    @Column()
    capacity: number

    @OneToOne(() => Show, (show) => show.room)
    show: Show;


    constructor(id: number, name: string, description: string, type: string, state: boolean, handicapAvailable: boolean, capacity: number, show: Show) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.state = state;
        this.handicapAvailable = handicapAvailable;
        this.capacity = capacity;
        this.show = show;
    }
}