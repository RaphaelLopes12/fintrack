CREATE TABLE public.credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_four_digits TEXT NOT NULL CHECK (char_length(last_four_digits) = 4),
  brand TEXT NOT NULL CHECK (brand IN ('visa', 'mastercard', 'elo', 'amex', 'hipercard', 'other')),
  card_limit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  billing_day INTEGER NOT NULL CHECK (billing_day BETWEEN 1 AND 31),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_credit_cards_user_id ON public.credit_cards(user_id);

CREATE TRIGGER credit_cards_updated_at
  BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
