-- Function to seed default categories for a new user
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Income categories
  INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
    (p_user_id, 'Salario', 'income', 'banknote', '#22c55e', true),
    (p_user_id, 'Freelance', 'income', 'laptop', '#3b82f6', true),
    (p_user_id, 'Investimentos', 'income', 'trending-up', '#8b5cf6', true),
    (p_user_id, 'Presente', 'income', 'gift', '#ec4899', true),
    (p_user_id, 'Outros', 'income', 'circle', '#6b7280', true)
  ON CONFLICT (user_id, name, type) DO NOTHING;

  -- Expense categories
  INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
    (p_user_id, 'Alimentacao', 'expense', 'utensils', '#f97316', true),
    (p_user_id, 'Transporte', 'expense', 'car', '#3b82f6', true),
    (p_user_id, 'Moradia', 'expense', 'home', '#8b5cf6', true),
    (p_user_id, 'Saude', 'expense', 'heart-pulse', '#ef4444', true),
    (p_user_id, 'Educacao', 'expense', 'graduation-cap', '#06b6d4', true),
    (p_user_id, 'Lazer', 'expense', 'gamepad-2', '#f59e0b', true),
    (p_user_id, 'Roupas', 'expense', 'shirt', '#ec4899', true),
    (p_user_id, 'Assinaturas', 'expense', 'repeat', '#6366f1', true),
    (p_user_id, 'Contas', 'expense', 'file-text', '#64748b', true),
    (p_user_id, 'Outros', 'expense', 'circle', '#6b7280', true)
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
