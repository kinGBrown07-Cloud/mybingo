-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    country TEXT NOT NULL,
    coins INTEGER DEFAULT 0,
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL CHECK (game_type IN ('CLASSIC', 'MAGIC', 'GOLD')),
    bet_amount INTEGER NOT NULL,
    use_coins BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    has_won BOOLEAN DEFAULT false,
    prize INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create card_flips table
CREATE TABLE IF NOT EXISTS public.card_flips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    card_index INTEGER NOT NULL,
    is_winning BOOLEAN NOT NULL,
    prize INTEGER,
    flipped_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'REFUND')),
    amount INTEGER NOT NULL,
    coins_amount INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    session_id UUID REFERENCES public.game_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
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

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
