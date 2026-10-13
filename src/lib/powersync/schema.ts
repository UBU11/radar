import { column, Schema, Table } from "@powersync/web";

export const meetupsTable = new Table({
  market_id: column.text,
  user_a_id: column.text,
  user_b_id: column.text,
  user_b_real_name: column.text,
  split_key_hash_a: column.text,
  split_key_hash_b: column.text,
  meetup_verified: column.integer,
  expires_at: column.text,
  created_at: column.text,
});

export const meetupMessagesTable = new Table({
  meetup_id: column.text,
  sender_id: column.text,
  encrypted_payload: column.text,
  created_at: column.text,
});

export const AppSchema = new Schema({
  meetups: meetupsTable,
  meetup_messages: meetupMessagesTable,
});

export type DatabaseSchema = typeof AppSchema;
