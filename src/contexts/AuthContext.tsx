import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Perfil, Organizacao } from '@/types'

interface AuthContextType {
  user: User | null;
  profile: Perfil | null;
  organization: Organizacao | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [organization, setOrganization] = useState<Organizacao | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileAndOrg = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) throw profileError
      
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

  const checkMockLogin = () => {
    if (localStorage.getItem('mock_admin_login') === 'true') {
      setUser({ id: 'mock-admin-id', email: 'admin@petconecta.com.br' } as User)
      setProfile({
        id: 'mock-admin-id',
        nome: 'Administrador Demo',
        cpf: '000.000.000-00',
        telefone: '(00) 00000-0000',
        tipo_perfil: 'admin_ong',
        organizacao_id: 'mock-org-id',
        criado_em: new Date().toISOString()
      })
      setOrganization({
        id: 'mock-org-id',
        nome: 'Prefeitura de Arapongas / PetConecta BR',
        tipo: 'prefeitura',
        municipio_id: 'mock-city-id',
        ativo: true,
        criado_em: new Date().toISOString()
      } as Organizacao)
      setLoading(false)
      return true
    }
    return false
  }

  useEffect(() => {
    if (checkMockLogin()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndOrg(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (checkMockLogin()) return;
      
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfileAndOrg(session.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setOrganization(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (localStorage.getItem('mock_admin_login') === 'true') {
      localStorage.removeItem('mock_admin_login')
      setUser(null)
      setProfile(null)
      setOrganization(null)
      window.location.href = '/login'
      return
    }
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndOrg(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, organization, loading, signOut, refreshProfile }}>
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
