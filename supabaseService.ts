
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from './types';

// Estas variáveis de ambiente precisam ser configuradas no seu ambiente de build/deploy (ex: GitHub Secrets)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase URL ou Anon Key não configuradas. O placar global não funcionará.");
}

// O '!' assume que as variáveis estarão presentes; em um cenário real, trate a ausência delas.
export const supabase: SupabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const MAX_LEADERBOARD_ENTRIES = 10;

export const getLeaderboardFromSupabase = async (): Promise<LeaderboardEntry[]> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase não configurado. Retornando placar vazio.");
    return [];
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .order('wave', { ascending: false })
    .order('durationMinutes', { ascending: false }) // Critério de desempate
    .limit(MAX_LEADERBOARD_ENTRIES);

  if (error) {
    console.error('Erro ao buscar placar do Supabase:', error);
    throw error; // Ou retorne [] para não quebrar a UI em caso de falha de rede, etc.
  }
  
  // O Supabase retorna a data como YYYY-MM-DD. Precisamos formatar para dd/MM/yyyy para exibição.
  return (data || []).map(entry => ({
    ...entry,
    date: entry.date ? new Date(entry.date + 'T00:00:00Z').toLocaleDateString('pt-BR') : 'Data Inválida' // Adiciona T00:00:00Z para tratar como UTC e evitar off-by-one
  }));
};

export const submitScoreToSupabase = async (newEntry: LeaderboardEntry): Promise<LeaderboardEntry | null> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase não configurado. Pontuação não será salva.");
    return null;
  }
  
  // A data já deve estar formatada como YYYY-MM-DD antes de chamar esta função.
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([newEntry])
    .select()
    .single(); // Para retornar a entrada inserida

  if (error) {
    console.error('Erro ao submeter pontuação para o Supabase:', error);
    if (error.code === '23505') { // Código de violação de chave primária (id duplicado)
        console.warn('Tentativa de submeter pontuação com ID duplicado:', newEntry.id);
        // Poderia tentar atualizar ou apenas ignorar. Por ora, lança o erro.
    }
    throw error;
  }

  return data ? {
    ...data,
     date: data.date ? new Date(data.date + 'T00:00:00Z').toLocaleDateString('pt-BR') : 'Data Inválida'
  } : null;
};
