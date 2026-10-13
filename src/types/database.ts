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
        Relationships: [];
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
        Relationships: [];
      };
      bets: {
        Row: {
          id: string;
          idempotency_key: string;
          market_id: string;
          user_id: string;
          outcome: "YES" | "NO";
          amount: number;
          odds_at_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          idempotency_key: string;
          market_id: string;
          user_id: string;
          outcome: "YES" | "NO";
          amount: number;
          odds_at_time: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          idempotency_key?: string;
          market_id?: string;
          user_id?: string;
          outcome?: "YES" | "NO";
          amount?: number;
          odds_at_time?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bets_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      market_messages: {
        Row: {
          id: string;
          idempotency_key: string;
          market_id: string;
          anonymous_handle: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          idempotency_key: string;
          market_id: string;
          anonymous_handle: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          idempotency_key?: string;
          market_id?: string;
          anonymous_handle?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "market_messages_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
      meetups: {
        Row: {
          id: string;
          market_id: string;
          user_a_id: string;
          user_b_id: string;
          status: "pending" | "verified" | "expired";
          meetup_verified: boolean;
          pin_hash: string;
          salt: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          market_id: string;
          user_a_id: string;
          user_b_id: string;
          status?: "pending" | "verified" | "expired";
          meetup_verified?: boolean;
          pin_hash: string;
          salt: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          market_id?: string;
          user_a_id?: string;
          user_b_id?: string;
          status?: "pending" | "verified" | "expired";
          meetup_verified?: boolean;
          pin_hash?: string;
          salt?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meetups_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "meetup_messages_meetup_id_fkey";
            columns: ["meetup_id"];
            isOneToOne: false;
            referencedRelation: "meetups";
            referencedColumns: ["id"];
          }
        ];
      };
      user_private_profiles: {
        Row: {
          user_id: string;
          real_name: string;
          contact_handle: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          real_name: string;
          contact_handle: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          real_name?: string;
          contact_handle?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_private_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
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
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
