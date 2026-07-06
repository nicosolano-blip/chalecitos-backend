-- Los Chalecitos Database Schema
-- Ejecutar en Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cobrador')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cabanas table
CREATE TABLE IF NOT EXISTS cabanas (
  id BIGSERIAL PRIMARY KEY,
  numero INTEGER UNIQUE NOT NULL,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  descripcion TEXT,
  precio_noche DECIMAL(10,2) NOT NULL,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('particular', 'grupo')),
  fecha_desde DATE NOT NULL,
  fecha_hasta DATE NOT NULL,
  cabanas_data JSONB NOT NULL DEFAULT '{}',
  total_personas INTEGER NOT NULL CHECK (total_personas > 0),
  precio_total DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2),
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_fechas CHECK (fecha_hasta > fecha_desde)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT REFERENCES reservations(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  metodo TEXT CHECK (metodo IN ('efectivo', 'tarjeta', 'transferencia')),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'fallido')),
  fecha_pago DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  tabla TEXT NOT NULL,
  registro_id BIGINT,
  accion TEXT NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  usuario_email TEXT,
  datos_nuevos JSONB,
  datos_antiguos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cabanas_numero ON cabanas(numero);
CREATE INDEX idx_reservations_fecha ON reservations(fecha_desde, fecha_hasta);
CREATE INDEX idx_reservations_estado ON reservations(estado);
CREATE INDEX idx_reservations_created_by ON reservations(created_by);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);

-- Insert initial users (passwords will be hashed on API side)
INSERT INTO users (email, name, role, password_hash) VALUES
  ('bety@chalecitos.local', 'Bety', 'admin', 'bety2026'),
  ('maxi@chalecitos.local', 'Maxi', 'cobrador', 'maxi26')
ON CONFLICT (email) DO NOTHING;

-- Insert initial cabanas
INSERT INTO cabanas (numero, capacidad, descripcion, precio_noche) VALUES
  (1, 4, 'Cabaña clásica con chimenea', 150.00),
  (2, 6, 'Cabaña familiar spaciosa', 180.00),
  (3, 4, 'Cabaña con vista a montaña', 160.00),
  (4, 2, 'Cabaña romántica', 120.00),
  (5, 4, 'Cabaña con balcón', 155.00),
  (6, 6, 'Cabaña premium', 200.00),
  (7, 4, 'Cabaña estándar', 145.00),
  (8, 3, 'Cabaña cozy', 130.00)
ON CONFLICT (numero) DO NOTHING;

-- Set RLS policies (Row Level Security)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all, cobradores can see their own
CREATE POLICY "reservations_select_policy" ON reservations
  FOR SELECT USING (true);

CREATE POLICY "reservations_insert_policy" ON reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reservations_update_policy" ON reservations
  FOR UPDATE USING (true);
