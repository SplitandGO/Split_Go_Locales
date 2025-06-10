-- Políticas para la tabla restaurants
CREATE POLICY "Los superadmins pueden ver todos los restaurantes"
ON restaurants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los superadmins pueden crear restaurantes"
ON restaurants FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los superadmins pueden actualizar restaurantes"
ON restaurants FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los superadmins pueden eliminar restaurantes"
ON restaurants FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

-- Políticas para la tabla users
CREATE POLICY "Los superadmins pueden ver todos los usuarios"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los superadmins pueden crear usuarios"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los superadmins pueden actualizar usuarios"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los superadmins pueden eliminar usuarios"
ON users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

-- Políticas para la tabla orders
CREATE POLICY "Los superadmins pueden ver todos los pedidos"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los clientes pueden ver sus propios pedidos"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'cliente'
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Los restaurantes pueden ver sus pedidos"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'mesero', 'cocina')
    AND users.restaurant_id = orders.restaurant_id
  )
);

-- Políticas para la tabla products
CREATE POLICY "Los superadmins pueden ver todos los productos"
ON products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'superadmin'
  )
);

CREATE POLICY "Los clientes pueden ver productos de cualquier restaurante"
ON products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'cliente'
  )
);

CREATE POLICY "Los restaurantes pueden ver sus productos"
ON products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'mesero', 'cocina')
    AND users.restaurant_id = products.restaurant_id
  )
);

-- Habilitar RLS en todas las tablas
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY; 