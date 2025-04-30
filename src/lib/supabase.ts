import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { GameType, GameSession, CardFlip, Transaction } from '@/types/game';
import type { Profile, Referral } from '@/types/database';
import { Pool, PoolConfig } from 'pg'
import { parse } from 'url'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Parse the connection string
const connectionString = process.env.DATABASE_URL!
const { host, port, auth, pathname } = parse(connectionString)

// Configure connection pool
const poolConfig: PoolConfig = {
  user: auth?.split(':')[0],
  password: auth?.split(':')[1],
  host: host || '',
  port: parseInt(port || '5432'),
  database: pathname?.split('/')[1],
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

export const pool = new Pool(poolConfig)

// Add event listener for errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Helper function to execute queries
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

// Service pour la gestion des utilisateurs
export const userService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const gameService = {
  async createGameSession(userId: string, gameType: GameType, betAmount: number, useCoins: boolean): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        game_type: gameType,
        bet_amount: betAmount,
        use_coins: useCoins,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game session:', error);
      return null;
    }

    return data;
  },

  async flipCard(sessionId: string, cardIndex: number, isWinning: boolean, prize: number | null): Promise<CardFlip | null> {
    const { data: cardFlip, error } = await supabase
      .from('card_flips')
      .insert({
        session_id: sessionId,
        card_index: cardIndex,
        is_winning: isWinning,
        prize: prize,
        points_earned: isWinning ? prize : 0 // Points gagnés uniquement si la carte est gagnante
      })
      .select()
      .single();

    if (error) {
      console.error('Error flipping card:', error);
      return null;
    }

    // Récupérer la session de jeu pour avoir l'ID de l'utilisateur
    const { data: session } = await supabase
      .from('game_sessions')
      .select('user_id, points_cost')
      .eq('id', sessionId)
      .single();

    if (session) {
      // Déduire les points pour le retournement de la carte
      await supabase.rpc('update_user_points', {
        p_user_id: session.user_id,
        p_points: -1 // Coût d'un point par retournement
      });
    }

    return cardFlip;
  },

  async completeGameSession(sessionId: string, hasWon: boolean, prize: number | null): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .update({
        has_won: hasWon,
        prize: prize,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error completing game session:', error);
      return null;
    }

    return data;
  },

  async getGameHistory(userId: string) {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        card_flips (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

export const transactionService = {
  async getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data;
  },

  async createTransaction(
    userId: string,
    type: Transaction['type'],
    amount: number,
    coinsAmount: number,
    sessionId?: string
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        coins_amount: coinsAmount,
        session_id: sessionId,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    return data;
  },

  async updateTransactionStatus(
    transactionId: string,
    status: Transaction['status']
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction status:', error);
      return null;
    }

    return data;
  },

  async getUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

export const referralService = {
  async getReferrer(userId: string): Promise<Profile | null> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('referrer_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile.referrer_id) {
      return null;
    }

    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.referrer_id)
      .single();

    if (referrerError) {
      console.error('Error getting referrer:', referrerError);
      return null;
    }

    return referrer;
  },

  async getReferralCommissionRate(referrerId: string, referredId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('referrals')
      .select('commission_rate')
      .eq('referrer_id', referrerId)
      .eq('referred_id', referredId)
      .single();

    if (error) {
      console.error('Error getting referral commission rate:', error);
      return null;
    }

    return data.commission_rate;
  },

  async createReferralCommission(
    referrerId: string,
    amount: number,
    coinsAmount: number,
    sessionId: string
  ): Promise<Transaction | null> {
    return transactionService.createTransaction(
      referrerId,
      'COMMISSION',
      amount,
      coinsAmount,
      sessionId
    );
  },

  async getAllReferrals(): Promise<(Referral & { referrer: Profile; referred: Profile })[] | null> {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referrer:profiles!referrals_referrer_id_fkey(*),
        referred:profiles!referrals_referred_id_fkey(*)
      `);

    if (error) {
      console.error('Error getting all referrals:', error);
      return null;
    }

    return data;
  },

  async createReferral(
    referrerId: string,
    referredId: string,
    commissionRate: number
  ): Promise<Referral | null> {
    // D'abord, mettre à jour le profil du filleul
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ referrer_id: referrerId })
      .eq('id', referredId);

    if (profileError) {
      console.error('Error updating referred profile:', profileError);
      return null;
    }

    // Ensuite, créer la relation de parrainage
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        commission_rate: commissionRate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating referral:', error);
      return null;
    }

    return data;
  },

  async updateReferralCommissionRate(
    referralId: string,
    commissionRate: number
  ): Promise<Referral | null> {
    const { data, error } = await supabase
      .from('referrals')
      .update({ commission_rate: commissionRate })
      .eq('id', referralId)
      .select()
      .single();

    if (error) {
      console.error('Error updating referral commission rate:', error);
      return null;
    }

    return data;
  },

  async deleteReferral(referralId: string): Promise<void> {
    // D'abord, récupérer le referral pour avoir l'ID du filleul
    const { data: referral, error: getReferralError } = await supabase
      .from('referrals')
      .select('referred_id')
      .eq('id', referralId)
      .single();

    if (getReferralError) {
      console.error('Error getting referral:', getReferralError);
      return;
    }

    // Mettre à jour le profil du filleul pour supprimer le referrer_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ referrer_id: null })
      .eq('id', referral.referred_id);

    if (profileError) {
      console.error('Error updating referred profile:', profileError);
      return;
    }

    // Supprimer la relation de parrainage
    const { error } = await supabase
      .from('referrals')
      .delete()
      .eq('id', referralId);

    if (error) {
      console.error('Error deleting referral:', error);
      return;
    }
  },
};

export const adminService = {
  async getDashboardStats() {
    const [
      usersResult,
      activeUsersResult,
      transactionsResult,
      gamesResult
    ] = await Promise.all([
      // Total des utilisateurs
      supabase
        .from('profiles')
        .select('count', { count: 'exact' }),
      
      // Utilisateurs actifs (au moins une partie dans les 30 derniers jours)
      supabase
        .from('game_sessions')
        .select('user_id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // Toutes les transactions
      supabase
        .from('transactions')
        .select('amount, type, status'),

      // Toutes les parties
      supabase
        .from('game_sessions')
        .select('bet_amount, prize, has_won')
    ]);

    // Calcul des statistiques
    const totalUsers = usersResult.count || 0;
    const activeUsers = new Set(activeUsersResult.data?.map(g => g.user_id)).size;
    
    const transactions = transactionsResult.data || [];
    const totalTransactions = transactions.length;
    const totalRevenue = transactions
      .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const games = gamesResult.data || [];
    const totalGamesPlayed = games.length;
    const totalWinnings = games
      .filter(g => g.has_won)
      .reduce((sum, g) => sum + (g.prize || 0), 0);

    return {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalRevenue,
      totalGamesPlayed,
      totalWinnings
    };
  },

  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting users:', error);
      return [];
    }

    return data;
  },

  async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting transactions:', error);
      return [];
    }

    return data;
  },

  async getAllGames(): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting games:', error);
      return [];
    }

    return data;
  },

  async addPointsToUser(
    userId: string,
    amount: number,
    note: string
  ): Promise<boolean> {
    // Début de la transaction
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return false;
    }

    // Créer la transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'ADMIN_CREDIT',
        amount: 0, // Pas de montant en euros
        coins_amount: amount,
        status: 'COMPLETED',
        note: note
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return false;
    }

    // Mettre à jour le solde de l'utilisateur
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: profile.coins + amount })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user balance:', updateError);
      return false;
    }

    return true;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return false;
    }

    return true;
  }
};
