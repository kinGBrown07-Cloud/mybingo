export type UserRole = 'user' | 'admin' | 'moderator';
export type GameType = 'foods' | 'mode' | 'jackpot';
export type PrizeStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';
export type TransactionType = 'win' | 'loss' | 'refund';

export interface User {
    id: string;
    email: string;
    password_hash: string;
    username: string;
    role: UserRole;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    points: number;
    total_games_played: number;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
    is_verified: boolean;
    is_active: boolean;
}

export interface Session {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    created_at: Date;
    ip_address?: string;
    user_agent?: string;
}

export interface Game {
    id: string;
    name: string;
    type: GameType;
    description?: string;
    min_points: number;
    max_points: number;
    win_rate: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface GameSession {
    id: string;
    user_id: string;
    game_id: string;
    points_wagered: number;
    points_won?: number;
    result?: {
        cardFlips: Array<{
            index: number;
            isWinning: boolean;
            prizeAmount?: number;
        }>;
        outcome: 'win' | 'loss';
        totalPrize?: number;
    };
    started_at: Date;
    ended_at?: Date;
    ip_address?: string;
}

export interface Prize {
    id: string;
    name: string;
    description?: string;
    category: string;
    points_cost: number;
    stock: number;
    image_url?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserPrize {
    id: string;
    user_id: string;
    prize_id: string;
    game_session_id?: string;
    status: PrizeStatus;
    tracking_number?: string;
    shipping_address?: string;
    claimed_at: Date;
    shipped_at?: Date;
    delivered_at?: Date;
    notes?: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    game_session_id?: string;
    type: TransactionType;
    points_amount: number;
    created_at: Date;
    description?: string;
}

export interface DailyStats {
    id: string;
    date: Date;
    total_games_played: number;
    total_points_wagered: number;
    total_points_won: number;
    total_prizes_claimed: number;
    unique_players: number;
    created_at: Date;
    updated_at: Date;
}

// Types pour les relations
export interface UserWithRelations extends User {
    sessions?: Session[];
    game_sessions?: GameSession[];
    prizes?: UserPrize[];
    transactions?: Transaction[];
}

export interface GameWithRelations extends Game {
    sessions?: GameSession[];
}

export interface GameSessionWithRelations extends GameSession {
    user?: User;
    game?: Game;
    prize?: UserPrize;
    transaction?: Transaction;
}

export interface PrizeWithRelations extends Prize {
    user_prizes?: UserPrize[];
}

// Types pour les requêtes
export interface CreateUserInput {
    email: string;
    password: string;
    username: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
}

export interface UpdateUserInput {
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    is_active?: boolean;
}

export interface CreateGameSessionInput {
    game_id: string;
    points_wagered: number;
}

export interface ClaimPrizeInput {
    prize_id: string;
    game_session_id?: string;
    shipping_address?: string;
}
