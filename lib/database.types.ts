export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          type: string
          capabilities: string[]
          coverage_lat: number
          coverage_lng: number
          coverage_radius: number
          status: string
          contact_email: string
          contact_phone: string
          contact_emergency: string
          address: string
          operating_hours_start: string
          operating_hours_end: string
          operating_timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          capabilities?: string[]
          coverage_lat: number
          coverage_lng: number
          coverage_radius: number
          status?: string
          contact_email: string
          contact_phone: string
          contact_emergency: string
          address: string
          operating_hours_start: string
          operating_hours_end: string
          operating_timezone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          capabilities?: string[]
          coverage_lat?: number
          coverage_lng?: number
          coverage_radius?: number
          status?: string
          contact_email?: string
          contact_phone?: string
          contact_emergency?: string
          address?: string
          operating_hours_start?: string
          operating_hours_end?: string
          operating_timezone?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          severity: string
          title: string
          description: string
          affected_areas: Json
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          severity: string
          title: string
          description: string
          affected_areas: Json
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          severity?: string
          title?: string
          description?: string
          affected_areas?: Json
          is_active?: boolean
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          type: string
          name: string
          quantity: number
          unit: string
          location_lat: number
          location_lng: number
          status: string
          organization_id: string
          expiry_date?: string
          conditions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          name: string
          quantity: number
          unit: string
          location_lat: number
          location_lng: number
          status?: string
          organization_id: string
          expiry_date?: string
          conditions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: string
          name?: string
          quantity?: number
          unit?: string
          location_lat?: number
          location_lng?: number
          status?: string
          expiry_date?: string
          conditions?: string[]
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}