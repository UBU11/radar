import { column, Schema, Table } from "@powersync/web";

export const meetupsTable = new Table({
  name: "meetups",
  columns: [
    new column.text("market_id"),
    new column.text("user_a_id"),
    new column.text("user_b_id"),
    new column.text("user_b_real_name"),
    new column.text("split_key_hash_a"),
    new column.text("split_key_hash_b"),
    new column.integer("meetup_verified"),
    new column.text("expires_at"),
    new column.text("created_at"),
  ],
});

export const meetupMessagesTable = new Table({
  name: "meetup_messages",
  columns: [
    new column.text("meetup_id"),
    new column.text("sender_id"),
    new column.text("encrypted_payload"),
    new column.text("created_at"),
  ],
});

export const AppSchema = new Schema([meetupsTable, meetupMessagesTable]);
export type DatabaseSchema = typeof AppSchema;
