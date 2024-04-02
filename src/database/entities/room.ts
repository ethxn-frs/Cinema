import { Column } from "typeorm"
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn"
import { Entity } from "typeorm/decorator/entity/Entity"


@Entity()
export class Room {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    name: string

    @Column()
    descrition: string

    @Column()
    type: string

    @Column()
    state: boolean

    @Column()
    handicapAvailable: boolean

    @Column()
    capacity: number

    constructor(id: number, name: string, description: string, type: string, state: boolean, handicapAvailable: boolean, capacity: number) {
        this.id = id;
        this.name = name;
        this.descrition = description;
        this.type = type;
        this.state = state;
        this.handicapAvailable = handicapAvailable;
        this.capacity = capacity
    }
}