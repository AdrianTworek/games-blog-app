import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.index('email');
  });

  await knex.schema.createTable('refresh_tokens', (table) => {
    table.string('id').primary();
    table.string('token').notNullable().unique();
    table.string('userId').notNullable();
    table.foreign('userId').references('users.id');
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropIndex('email');
  });

  await knex.schema.dropTable('refresh_tokens');
}
