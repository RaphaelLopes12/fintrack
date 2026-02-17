-- Monthly summary function
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

-- Category breakdown function
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
