export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          balance?: number;
          created_at?: string;
        };
      };
      markets: {
        Row: {
          id: string;
          title: string;
          category: string;
          resolution_criteria: string;
          expiry_date: string;
          status: "open" | "resolved" | "cancelled";
          total_pool_yes: number;
          total_pool_no: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          resolution_criteria: string;
          expiry_date: string;
          status?: "open" | "resolved" | "cancelled";
          total_pool_yes?: number;
          total_pool_no?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          resolution_criteria?: string;
          expiry_date?: string;
          status?: "open" | "resolved" | "cancelled";
          total_pool_yes?: number;
          total_pool_no?: number;
          created_at?: string;
        };
      };
      bets: {
        Row: {
          id: string;
          market_id: string;
          user_id: string;
          outcome: "YES" | "NO";
          amount: number;
          odds_at_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          market_id: string;
          user_id: string;
          outcome: "YES" | "NO";
          amount: number;
          odds_at_time: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          market_id?: string;
          user_id?: string;
          outcome?: "YES" | "NO";
          amount?: number;
          odds_at_time?: number;
          created_at?: string;
        };
      };
      market_messages: {
        Row: {
          id: string;
          market_id: string;
          anonymous_handle: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          market_id: string;
          anonymous_handle: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          market_id?: string;
          anonymous_handle?: string;
          content?: string;
          created_at?: string;
        };
      };
      meetups: {
        Row: {
          id: string;
          market_id: string;
          user_a_id: string;
          user_b_id: string;
          user_b_real_name: string | null;
          split_key_hash_a: string;
          split_key_hash_b: string;
          meetup_verified: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          market_id: string;
          user_a_id: string;
          user_b_id: string;
          user_b_real_name: string;
          split_key_hash_a: string;
          split_key_hash_b: string;
          meetup_verified?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          market_id?: string;
          user_a_id?: string;
          user_b_id?: string;
          user_b_real_name?: string | null;
          split_key_hash_a?: string;
          split_key_hash_b?: string;
          meetup_verified?: boolean;
          expires_at?: string;
          created_at?: string;
        };
      };
      meetup_messages: {
        Row: {
          id: string;
          meetup_id: string;
          sender_id: string;
          encrypted_payload: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meetup_id: string;
          sender_id: string;
          encrypted_payload: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meetup_id?: string;
          sender_id?: string;
          encrypted_payload?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      deduct_user_balance_atomic: {
        Args: {
          p_user_id: string;
          p_amount: number;
        };
        Returns: boolean;
      };
    };
  };
}
