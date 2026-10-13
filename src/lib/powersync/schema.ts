import { column, Schema, Table } from "@powersync/web";

export const marketsTable = new Table({
  title: column.text,
  category: column.text,
  resolution_criteria: column.text,
  expiry_date: column.text,
  status: column.text,
  total_pool_yes: column.real,
  total_pool_no: column.real,
  created_at: column.text,
});

export const marketMessagesTable = new Table({
  idempotency_key: column.text,
  market_id: column.text,
  anonymous_handle: column.text,
  content: column.text,
  created_at: column.text,
});

export const meetupsTable = new Table({
  market_id: column.text,
  user_a_id: column.text,
  user_b_id: column.text,
  status: column.text,
  meetup_verified: column.integer,
  pin_hash: column.text,
  salt: column.text,
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
  markets: marketsTable,
  market_messages: marketMessagesTable,
  meetups: meetupsTable,
  meetup_messages: meetupMessagesTable,
});

export type DatabaseSchema = typeof AppSchema;
