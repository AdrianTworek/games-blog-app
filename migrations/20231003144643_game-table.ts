import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('games', (table) => {
    table.string('id').primary();
    table.string('title', 255).notNullable();
    table.string('description', 1000).notNullable();
    table.string('authorId').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable();

    table.foreign('authorId').references('id').inTable('users');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('games');
}
