-- Insert pizza sizes
INSERT INTO public.pizza_sizes (name, diameter_cm, price_multiplier, display_order) VALUES
  ('Small', 25, 0.8, 1),
  ('Medium', 30, 1.0, 2),
  ('Large', 35, 1.3, 3),
  ('Extra Large', 40, 1.6, 4)
ON CONFLICT DO NOTHING;

-- Insert crust types
INSERT INTO public.crust_types (name, description, additional_price, is_available) VALUES
  ('Classic', 'Our traditional hand-tossed crust', 0, true),
  ('Thin & Crispy', 'Light and crispy thin crust', 0, true),
  ('Thick & Fluffy', 'Deep dish style thick crust', 2.00, true),
  ('Stuffed Crust', 'Crust filled with melted cheese', 3.50, true),
  ('Gluten-Free', 'Specially prepared gluten-free base', 4.00, true)
ON CONFLICT DO NOTHING;

-- Insert categories
INSERT INTO public.categories (name, slug, description, display_order, is_active) VALUES
  ('Classics', 'classics', 'Traditional pizza favorites', 1, true),
  ('Gourmet', 'gourmet', 'Premium specialty pizzas', 2, true),
  ('Vegetarian', 'vegetarian', 'Delicious meat-free options', 3, true),
  ('Vegan', 'vegan', 'Plant-based pizzas', 4, true),
  ('Swiss Specials', 'swiss-specials', 'Local Swiss-inspired creations', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert toppings
INSERT INTO public.toppings (name, price, category, is_vegetarian, is_vegan, is_available) VALUES
  -- Cheese
  ('Mozzarella', 1.50, 'cheese', true, false, true),
  ('Parmesan', 1.50, 'cheese', true, false, true),
  ('Gorgonzola', 2.00, 'cheese', true, false, true),
  ('Swiss Gruyère', 2.50, 'cheese', true, false, true),
  ('Vegan Cheese', 2.50, 'cheese', true, true, true),
  
  -- Meat
  ('Pepperoni', 2.00, 'meat', false, false, true),
  ('Italian Sausage', 2.00, 'meat', false, false, true),
  ('Ham', 2.00, 'meat', false, false, true),
  ('Bacon', 2.50, 'meat', false, false, true),
  ('Chicken', 2.50, 'meat', false, false, true),
  ('Beef', 2.50, 'meat', false, false, true),
  ('Salami', 2.00, 'meat', false, false, true),
  
  -- Vegetables
  ('Mushrooms', 1.50, 'vegetable', true, true, true),
  ('Bell Peppers', 1.50, 'vegetable', true, true, true),
  ('Onions', 1.00, 'vegetable', true, true, true),
  ('Black Olives', 1.50, 'vegetable', true, true, true),
  ('Tomatoes', 1.50, 'vegetable', true, true, true),
  ('Spinach', 1.50, 'vegetable', true, true, true),
  ('Jalapeños', 1.50, 'vegetable', true, true, true),
  ('Arugula', 2.00, 'vegetable', true, true, true),
  ('Artichokes', 2.00, 'vegetable', true, true, true),
  ('Capers', 1.50, 'vegetable', true, true, true),
  ('Sun-dried Tomatoes', 2.00, 'vegetable', true, true, true),
  
  -- Sauce
  ('Extra Tomato Sauce', 1.00, 'sauce', true, true, true),
  ('Pesto', 2.00, 'sauce', true, false, true),
  ('BBQ Sauce', 1.50, 'sauce', true, true, true),
  ('Garlic Oil', 1.50, 'sauce', true, true, true),
  
  -- Other
  ('Basil', 1.00, 'other', true, true, true),
  ('Oregano', 0.50, 'other', true, true, true),
  ('Chili Flakes', 0.50, 'other', true, true, true)
ON CONFLICT DO NOTHING;

-- Insert pizzas (we'll get category IDs dynamically)
DO $$
DECLARE
  classics_id UUID;
  gourmet_id UUID;
  vegetarian_id UUID;
  vegan_id UUID;
  swiss_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO classics_id FROM public.categories WHERE slug = 'classics';
  SELECT id INTO gourmet_id FROM public.categories WHERE slug = 'gourmet';
  SELECT id INTO vegetarian_id FROM public.categories WHERE slug = 'vegetarian';
  SELECT id INTO vegan_id FROM public.categories WHERE slug = 'vegan';
  SELECT id INTO swiss_id FROM public.categories WHERE slug = 'swiss-specials';

  -- Insert classic pizzas
  INSERT INTO public.pizzas (name, slug, description, category_id, base_price, is_vegetarian, is_vegan, is_available) VALUES
    ('Margherita', 'margherita', 'Classic tomato sauce, mozzarella, and fresh basil', classics_id, 12.90, true, false, true),
    ('Pepperoni', 'pepperoni', 'Tomato sauce, mozzarella, and premium pepperoni', classics_id, 14.90, false, false, true),
    ('Hawaiian', 'hawaiian', 'Tomato sauce, mozzarella, ham, and pineapple', classics_id, 15.90, false, false, true),
    ('Quattro Formaggi', 'quattro-formaggi', 'Four cheese blend: mozzarella, parmesan, gorgonzola, and gruyère', classics_id, 16.90, true, false, true),
    
    -- Gourmet pizzas
    ('Prosciutto e Rucola', 'prosciutto-e-rucola', 'Mozzarella, prosciutto, arugula, parmesan, and balsamic glaze', gourmet_id, 18.90, false, false, true),
    ('Truffle Mushroom', 'truffle-mushroom', 'Cream sauce, mozzarella, mixed mushrooms, and truffle oil', gourmet_id, 19.90, true, false, true),
    ('BBQ Chicken', 'bbq-chicken', 'BBQ sauce, mozzarella, grilled chicken, red onions, and cilantro', gourmet_id, 17.90, false, false, true),
    
    -- Vegetarian pizzas
    ('Veggie Supreme', 'veggie-supreme', 'Tomato sauce, mozzarella, mushrooms, peppers, onions, olives, and tomatoes', vegetarian_id, 15.90, true, false, true),
    ('Spinach & Ricotta', 'spinach-ricotta', 'Cream sauce, mozzarella, ricotta, spinach, and garlic', vegetarian_id, 16.90, true, false, true),
    ('Mediterranean', 'mediterranean', 'Tomato sauce, mozzarella, feta, olives, sun-dried tomatoes, and artichokes', vegetarian_id, 17.90, true, false, true),
    
    -- Vegan pizzas
    ('Vegan Margherita', 'vegan-margherita', 'Tomato sauce, vegan cheese, and fresh basil', vegan_id, 14.90, true, true, true),
    ('Vegan Garden', 'vegan-garden', 'Tomato sauce, vegan cheese, mushrooms, peppers, spinach, and arugula', vegan_id, 16.90, true, true, true),
    
    -- Swiss specials
    ('Swiss Alpine', 'swiss-alpine', 'Cream sauce, gruyère, bacon, caramelized onions, and potatoes', swiss_id, 18.90, false, false, true),
    ('Zürich Style', 'zurich-style', 'Cream sauce, mozzarella, veal, mushrooms, and white wine sauce', swiss_id, 19.90, false, false, true),
    ('Raclette Pizza', 'raclette-pizza', 'Raclette cheese, potatoes, pickles, and onions', swiss_id, 17.90, true, false, true)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Insert delivery zones (Swiss cantons and postal codes)
INSERT INTO public.delivery_zones (canton, postal_codess, delivery_fee, min_order_amount, estimated_delivery_minutes, is_active) VALUES
  ('Zürich', ARRAY['8000', '8001', '8002', '8003', '8004', '8005', '8006', '8008', '8032', '8037', '8038', '8044', '8045', '8046', '8047', '8048', '8049', '8050', '8051', '8052', '8053', '8055', '8057'], 5.00, 20.00, 30, true),
  ('Bern', ARRAY['3000', '3001', '3003', '3004', '3005', '3006', '3007', '3008', '3010', '3011', '3012', '3013', '3014', '3015'], 5.00, 20.00, 35, true),
  ('Luzern', ARRAY['6000', '6003', '6004', '6005', '6006', '6010', '6011', '6012', '6013', '6014', '6015', '6016'], 5.00, 20.00, 35, true),
  ('Basel', ARRAY['4000', '4001', '4002', '4051', '4052', '4053', '4054', '4055', '4056', '4057', '4058'], 5.00, 20.00, 30, true),
  ('Genève', ARRAY['1200', '1201', '1202', '1203', '1204', '1205', '1206', '1207', '1208', '1209'], 6.00, 25.00, 35, true),
  ('Lausanne', ARRAY['1000', '1800', '1820', '1009', '1010'], 30.00, 25.00, 35, true)
ON CONFLICT DO NOTHING;
