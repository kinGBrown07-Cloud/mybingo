-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_flips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Game sessions policies
CREATE POLICY "Users can view their own game sessions"
    ON public.game_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions"
    ON public.game_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Card flips policies
CREATE POLICY "Users can view card flips from their sessions"
    ON public.card_flips FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = card_flips.session_id
        AND game_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can create card flips for their sessions"
    ON public.card_flips FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.game_sessions
        WHERE game_sessions.id = card_flips.session_id
        AND game_sessions.user_id = auth.uid()
    ));

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);
