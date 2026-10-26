import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Perfil, Organizacao } from '@/types'

export type DemoUserType = 'admin' | 'clinica' | 'cidadao_aprovado' | 'cidadao_novo';

interface AuthContextType {
  user: User | null
  profile: Perfil | null
  organization: Organizacao | null
  loading: boolean
  isDemoUser: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  loginAsDemo: (tipo: DemoUserType) => void
}

const STORAGE_DEMO = 'petconecta_demo_auth';

const DEMO_ACCOUNTS: Record<DemoUserType, { user: User; profile: Perfil }> = {
  admin: {
    user: {
      id: 'demo-admin-id',
      app_metadata: {},
      user_metadata: { nome: 'Secretaria do Meio Ambiente' },
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00Z',
      email: 'admin@arapongas.pr.gov.br',
    } as unknown as User,
    profile: {
      id: 'demo-admin-id',
      nome: 'Secretaria de Meio Ambiente e Bem-Estar Animal',
      cpf: '000.000.000-00',
      telefone: '(43) 3902-1000',
      tipo_perfil: 'admin_prefeitura',
      endereco: 'Rua das Garças, 750',
      bairro: 'Centro',
      cep: '86700-000',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    }
  },
  clinica: {
    user: {
      id: 'demo-vet-id',
      app_metadata: {},
      user_metadata: { nome: 'Dr. Roberto Mendes (PetVida)' },
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00Z',
      email: 'vet.petvida@arapongas.pr.gov.br',
    } as unknown as User,
    profile: {
      id: 'demo-vet-id',
      nome: 'Dr. Roberto Mendes (PetVida Arapongas)',
      cpf: '111.222.333-44',
      telefone: '(43) 99876-5432',
      tipo_perfil: 'veterinario',
      clinica_id: 'clinica-002',
      endereco: 'Av. Arapongas, 1280',
      bairro: 'Vila Araponguinha',
      cep: '86701-000',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    }
  },
  cidadao_aprovado: {
    user: {
      id: 'demo-maria-id',
      app_metadata: {},
      user_metadata: { nome: 'Maria de Lourdes' },
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00Z',
      email: 'dona.maria@arapongas.pr.gov.br',
    } as unknown as User,
    profile: {
      id: 'demo-maria-id',
      nome: 'Maria de Lourdes (Protetora - 9 animais)',
      cpf: '123.456.789-00',
      telefone: '(43) 99876-1234',
      tipo_perfil: 'cidadao',
      endereco: 'Rua das Camélias, 120',
      bairro: 'Vila Araponguinha',
      cep: '86703-210',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    }
  },
  cidadao_novo: {
    user: {
      id: 'demo-joao-id',
      app_metadata: {},
      user_metadata: { nome: 'João da Silva' },
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00Z',
      email: 'joao.silva@gmail.com',
    } as unknown as User,
    profile: {
      id: 'demo-joao-id',
      nome: 'João da Silva (Tutor)',
      cpf: '987.654.321-99',
      telefone: '(43) 99123-4567',
      tipo_perfil: 'cidadao',
      endereco: 'Rua das Pombas, 300',
      bairro: 'Centro',
      cep: '86700-050',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [organization, setOrganization] = useState<Organizacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoUser, setIsDemoUser] = useState(false)

  const loginAsDemo = (tipo: DemoUserType) => {
    const demo = DEMO_ACCOUNTS[tipo];
    if (demo) {
      localStorage.setItem(STORAGE_DEMO, tipo);
      setUser(demo.user);
      setProfile(demo.profile);
      setIsDemoUser(true);
      setLoading(false);
    }
  };

  const fetchProfileAndOrg = async (userObj: User) => {
    try {
      let { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userObj.id)
        .single()
      
      if (profileError && profileError.code === 'PGRST116') {
        if (userObj.user_metadata?.nome) {
          const { data: newProfile, error: insertError } = await supabase.from('perfis').insert({
            id: userObj.id,
            nome: userObj.user_metadata.nome,
            cpf: userObj.user_metadata.cpf || '000.000.000-00',
            rg: userObj.user_metadata.rg || null,
            data_nascimento: userObj.user_metadata.data_nascimento || null,
            telefone: userObj.user_metadata.telefone || '(43) 99999-9999',
            endereco: userObj.user_metadata.endereco || 'Arapongas - PR',
            numero: userObj.user_metadata.numero || 'S/N',
            complemento: userObj.user_metadata.complemento || null,
            bairro: userObj.user_metadata.bairro || 'Centro',
            cep: userObj.user_metadata.cep || '86700-000',
            tipo_perfil: 'cidadao'
          }).select().single();
          
          if (!insertError && newProfile) {
            profileData = newProfile;
            profileError = null;
          }
        }
      }

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return;
      }
      
      setProfile(profileData)

      if (profileData?.organizacao_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizacoes')
          .select('*')
          .eq('id', profileData.organizacao_id)
          .single()
          
        if (!orgError) {
          setOrganization(orgData)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  useEffect(() => {
    // 1. Checa se existe sessão de demonstração prévia
    const storedDemo = localStorage.getItem(STORAGE_DEMO) as DemoUserType | null;
    if (storedDemo && DEMO_ACCOUNTS[storedDemo]) {
      setUser(DEMO_ACCOUNTS[storedDemo].user);
      setProfile(DEMO_ACCOUNTS[storedDemo].profile);
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    // 2. Se não houver demo, checa Supabase real
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndOrg(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Se estamos em demo mode, ignora deslogamentos espúrios do supabase
      if (localStorage.getItem(STORAGE_DEMO)) return;

      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfileAndOrg(session.user).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setOrganization(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    localStorage.removeItem(STORAGE_DEMO);
    setIsDemoUser(false);
    setUser(null);
    setProfile(null);
    setOrganization(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
  }

  const refreshProfile = async () => {
    if (isDemoUser) return;
    if (user) {
      await fetchProfileAndOrg(user)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      organization, 
      loading, 
      isDemoUser, 
      signOut, 
      refreshProfile, 
      loginAsDemo 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
