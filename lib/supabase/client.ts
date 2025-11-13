import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis não estão configuradas, retorna um cliente com valores placeholder
  // Isso permite que a página renderize sem erros, mas o login não funcionará
  if (!supabaseUrl || !supabaseAnonKey) {
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  // O createBrowserClient do @supabase/ssr já gerencia cookies automaticamente
  // Não precisamos configurar manualmente
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

