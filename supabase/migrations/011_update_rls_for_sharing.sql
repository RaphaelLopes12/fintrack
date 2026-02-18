-- Helper function: checks if the current user has shared access to another user's data
CREATE OR REPLACE FUNCTION has_shared_access(
  p_owner_id UUID,
  p_permission TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.shared_access
    WHERE owner_id = p_owner_id
      AND shared_with_id = auth.uid()
      AND status = 'accepted'
      AND (p_permission IS NULL OR permission = p_permission)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view own and shared profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR id IN (
      SELECT shared_with_id FROM public.shared_access
      WHERE owner_id = auth.uid() AND status = 'accepted'
    )
    OR id IN (
      SELECT owner_id FROM public.shared_access
      WHERE shared_with_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;

CREATE POLICY "Users can view own and shared categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id OR has_shared_access(user_id));

CREATE POLICY "Users can insert own or shared editor categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can update own or shared editor categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'))
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can delete own or shared editor categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

-- ============================================================
-- CREDIT CARDS
-- ============================================================
DROP POLICY IF EXISTS "Users can CRUD their own credit cards" ON public.credit_cards;

CREATE POLICY "Users can view own and shared credit cards"
  ON public.credit_cards FOR SELECT
  USING (auth.uid() = user_id OR has_shared_access(user_id));

CREATE POLICY "Users can insert own or shared editor credit cards"
  ON public.credit_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can update own or shared editor credit cards"
  ON public.credit_cards FOR UPDATE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'))
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can delete own or shared editor credit cards"
  ON public.credit_cards FOR DELETE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

-- ============================================================
-- TRANSACTIONS
-- ============================================================
DROP POLICY IF EXISTS "Users can CRUD their own transactions" ON public.transactions;

CREATE POLICY "Users can view own and shared transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR has_shared_access(user_id));

CREATE POLICY "Users can insert own or shared editor transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can update own or shared editor transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'))
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can delete own or shared editor transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

-- ============================================================
-- CREDIT CARD INVOICES (via card ownership)
-- ============================================================
DROP POLICY IF EXISTS "Users can view invoices for their cards" ON public.credit_card_invoices;
DROP POLICY IF EXISTS "Users can manage invoices for their cards" ON public.credit_card_invoices;
DROP POLICY IF EXISTS "Users can update invoices for their cards" ON public.credit_card_invoices;
DROP POLICY IF EXISTS "Users can delete invoices for their cards" ON public.credit_card_invoices;

CREATE POLICY "Users can view own and shared invoices"
  ON public.credit_card_invoices FOR SELECT
  USING (
    credit_card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid())
    OR credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE has_shared_access(user_id)
    )
  );

CREATE POLICY "Users can insert own or shared editor invoices"
  ON public.credit_card_invoices FOR INSERT
  WITH CHECK (
    credit_card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid())
    OR credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE has_shared_access(user_id, 'editor')
    )
  );

CREATE POLICY "Users can update own or shared editor invoices"
  ON public.credit_card_invoices FOR UPDATE
  USING (
    credit_card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid())
    OR credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE has_shared_access(user_id, 'editor')
    )
  )
  WITH CHECK (
    credit_card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid())
    OR credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE has_shared_access(user_id, 'editor')
    )
  );

CREATE POLICY "Users can delete own or shared editor invoices"
  ON public.credit_card_invoices FOR DELETE
  USING (
    credit_card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid())
    OR credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE has_shared_access(user_id, 'editor')
    )
  );

-- ============================================================
-- RECURRING EXPENSES
-- ============================================================
DROP POLICY IF EXISTS "Users can CRUD their own recurring expenses" ON public.recurring_expenses;

CREATE POLICY "Users can view own and shared recurring expenses"
  ON public.recurring_expenses FOR SELECT
  USING (auth.uid() = user_id OR has_shared_access(user_id));

CREATE POLICY "Users can insert own or shared editor recurring expenses"
  ON public.recurring_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can update own or shared editor recurring expenses"
  ON public.recurring_expenses FOR UPDATE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'))
  WITH CHECK (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

CREATE POLICY "Users can delete own or shared editor recurring expenses"
  ON public.recurring_expenses FOR DELETE
  USING (auth.uid() = user_id OR has_shared_access(user_id, 'editor'));

-- ============================================================
-- UPDATE SECURITY DEFINER RPCs TO VALIDATE SHARED ACCESS
-- ============================================================
CREATE OR REPLACE FUNCTION get_monthly_summary(
  p_user_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS TABLE(
  total_income NUMERIC,
  total_expenses NUMERIC,
  balance NUMERIC,
  transaction_count BIGINT
) AS $$
BEGIN
  IF p_user_id != auth.uid() AND NOT has_shared_access(p_user_id) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) AS balance,
    COUNT(*)::BIGINT AS transaction_count
  FROM public.transactions t
  WHERE t.user_id = p_user_id
    AND EXTRACT(MONTH FROM t.date) = p_month
    AND EXTRACT(YEAR FROM t.date) = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_category_breakdown(
  p_user_id UUID,
  p_month INTEGER,
  p_year INTEGER,
  p_type TEXT DEFAULT 'expense'
)
RETURNS TABLE(
  category_id UUID,
  category_name TEXT,
  category_icon TEXT,
  category_color TEXT,
  total NUMERIC,
  percentage NUMERIC
) AS $$
BEGIN
  IF p_user_id != auth.uid() AND NOT has_shared_access(p_user_id) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  WITH totals AS (
    SELECT
      t.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color,
      SUM(t.amount) AS total
    FROM public.transactions t
    JOIN public.categories c ON c.id = t.category_id
    WHERE t.user_id = p_user_id
      AND t.type = p_type
      AND EXTRACT(MONTH FROM t.date) = p_month
      AND EXTRACT(YEAR FROM t.date) = p_year
    GROUP BY t.category_id, c.name, c.icon, c.color
  )
  SELECT
    totals.category_id,
    totals.category_name,
    totals.category_icon,
    totals.category_color,
    totals.total,
    ROUND((totals.total / NULLIF(SUM(totals.total) OVER(), 0)) * 100, 1) AS percentage
  FROM totals
  ORDER BY totals.total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
