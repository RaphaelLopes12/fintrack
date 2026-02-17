CREATE TABLE public.credit_card_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(credit_card_id, month, year)
);

CREATE INDEX idx_invoices_credit_card_id ON public.credit_card_invoices(credit_card_id);
CREATE INDEX idx_invoices_due_date ON public.credit_card_invoices(due_date);
