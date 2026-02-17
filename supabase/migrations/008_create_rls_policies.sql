-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories
CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Credit Cards
CREATE POLICY "Users can CRUD their own credit cards"
  ON public.credit_cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can CRUD their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Credit Card Invoices (via card ownership)
CREATE POLICY "Users can view invoices for their cards"
  ON public.credit_card_invoices FOR SELECT
  USING (
    credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage invoices for their cards"
  ON public.credit_card_invoices FOR INSERT
  WITH CHECK (
    credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices for their cards"
  ON public.credit_card_invoices FOR UPDATE
  USING (
    credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoices for their cards"
  ON public.credit_card_invoices FOR DELETE
  USING (
    credit_card_id IN (
      SELECT id FROM public.credit_cards WHERE user_id = auth.uid()
    )
  );

-- Recurring Expenses
CREATE POLICY "Users can CRUD their own recurring expenses"
  ON public.recurring_expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
