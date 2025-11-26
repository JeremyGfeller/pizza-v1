-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage pizzas" ON public.pizzas;
DROP POLICY IF EXISTS "Admins can manage toppings" ON public.toppings;
DROP POLICY IF EXISTS "Admins can manage delivery zones" ON public.delivery_zones;

-- Recreate policies using auth.jwt() to avoid recursion
-- This reads the role directly from the JWT token instead of querying profiles table

-- Profiles policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Orders policies  
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'delivery')
  );

-- Categories policies
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Pizzas policies
CREATE POLICY "Admins can manage pizzas" ON public.pizzas
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Toppings policies
CREATE POLICY "Admins can manage toppings" ON public.toppings
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Delivery zones policies
CREATE POLICY "Admins can manage delivery zones" ON public.delivery_zones
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
