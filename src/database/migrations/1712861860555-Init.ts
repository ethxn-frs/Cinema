import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1712861860555 implements MigrationInterface {
    name = 'Init1712861860555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`state\` tinyint NOT NULL, \`handicapAvailable\` tinyint NOT NULL, \`capacity\` int NOT NULL, UNIQUE INDEX \`IDX_535c742a3606d2e3122f441b26\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`image\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`path\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_e4dfc6a6f95452c9c931f5df48\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`movie\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`show\` (\`id\` int NOT NULL AUTO_INCREMENT, \`startAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`endAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`state\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`used\` tinyint NOT NULL, \`price\` int NOT NULL, \`userId\` int NULL, \`showId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`login\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_a62473490b3e4578fd683235c5\` (\`login\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`sold\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`roles\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_605baeb040ff0fae995404cea37\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_0e01a7c92f008418bad6bad5919\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_ed3b00566d962fc53e061d27ea9\` FOREIGN KEY (\`showId\`) REFERENCES \`show\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_ed3b00566d962fc53e061d27ea9\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_0e01a7c92f008418bad6bad5919\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_605baeb040ff0fae995404cea37\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`roles\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`sold\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_a62473490b3e4578fd683235c5\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`login\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`DROP TABLE \`show\``);
        await queryRunner.query(`DROP TABLE \`movie\``);
        await queryRunner.query(`DROP INDEX \`IDX_e4dfc6a6f95452c9c931f5df48\` ON \`image\``);
        await queryRunner.query(`DROP TABLE \`image\``);
        await queryRunner.query(`DROP INDEX \`IDX_535c742a3606d2e3122f441b26\` ON \`room\``);
        await queryRunner.query(`DROP TABLE \`room\``);
        await queryRunner.query(`DROP TABLE \`transaction\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\` (\`email\`)`);
    }

}
