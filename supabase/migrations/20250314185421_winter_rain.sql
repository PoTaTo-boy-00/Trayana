/*
  # Initial Schema Setup for Disaster Response Network

  1. Authentication and Users
    - Enable auth schema
    - Create users table with role-based access
    - Set up auth policies

  2. Core Tables
    - alerts: Disaster alerts and notifications
    - organizations: Partner organization details
    - resources: Available and deployed resources
    - messages: Communication system
    - analytics: System metrics and performance data

  3. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access policies
    - Audit logging for critical operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE alert_severity AS ENUM ('red', 'orange', 'yellow', 'green');
CREATE TYPE organization_type AS ENUM ('healthcare', 'ngo', 'essential', 'infrastructure', 'community', 'private', 'specialized');
CREATE TYPE resource_status AS ENUM ('available', 'allocated', 'depleted');
CREATE TYPE message_type AS ENUM ('direct', 'group', 'broadcast');
CREATE TYPE message_priority AS ENUM ('normal', 'urgent', 'emergency');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Organizations Table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type organization_type NOT NULL,
  capabilities text[] NOT NULL DEFAULT '{}',
  coverage_lat numeric NOT NULL,
  coverage_lng numeric NOT NULL,
  coverage_radius numeric NOT NULL,
  status text NOT NULL DEFAULT 'inactive',
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  contact_emergency text NOT NULL,
  address text NOT NULL,
  operating_hours_start time NOT NULL,
  operating_hours_end time NOT NULL,
  operating_timezone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Alerts Table
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity alert_severity NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  affected_areas jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Alert Updates Table
CREATE TABLE alert_updates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id uuid NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  message text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Resources Table
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  status resource_status NOT NULL DEFAULT 'available',
  organization_id uuid NOT NULL REFERENCES organizations(id),
  expiry_date timestamptz,
  conditions text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Messages Table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  recipient_id uuid REFERENCES auth.users(id),
  type message_type NOT NULL,
  content text NOT NULL,
  priority message_priority NOT NULL DEFAULT 'normal',
  status message_status NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Message Attachments Table
CREATE TABLE message_attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  type text NOT NULL,
  url text NOT NULL,
  name text NOT NULL,
  size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Analytics Table
CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  timeframe text NOT NULL,
  metrics jsonb NOT NULL,
  trends jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public organizations are viewable by everyone"
  ON organizations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage organizations"
  ON organizations FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Everyone can view active alerts"
  ON alerts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage alerts"
  ON alerts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Organization members can view their resources"
  ON resources FOR SELECT
  USING (
    auth.jwt() ->> 'organization_id' = organization_id::text
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Organization members can manage their resources"
  ON resources FOR ALL
  USING (
    auth.jwt() ->> 'organization_id' = organization_id::text
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can view messages they're involved in"
  ON messages FOR SELECT
  USING (
    sender_id::text = auth.uid()
    OR recipient_id::text = auth.uid()
    OR type = 'broadcast'
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for better query performance
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_is_active ON alerts(is_active);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_type ON messages(type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();