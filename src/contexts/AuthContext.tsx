import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Perfil, Organizacao } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Perfil | null
  organization: Organizacao | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [organization, setOrganization] = useState<Organizacao | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileAndOrg = async (userObj: User) => {
    try {
      let { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userObj.id)
        .single()
      
      if (profileError && profileError.code === 'PGRST116') {
        // Not found - attempt to create from user_metadata if it exists
        if (userObj.user_metadata?.nome) {
          const { data: newProfile, error: insertError } = await supabase.from('perfis').insert({
            id: userObj.id,
            nome: userObj.user_metadata.nome,
            cpf: userObj.user_metadata.cpf,
            rg: userObj.user_metadata.rg || null,
            data_nascimento: userObj.user_metadata.data_nascimento || null,
            telefone: userObj.user_metadata.telefone,
            endereco: userObj.user_metadata.endereco,
            numero: userObj.user_metadata.numero,
            complemento: userObj.user_metadata.complemento || null,
            bairro: userObj.user_metadata.bairro,
            cep: userObj.user_metadata.cep,
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndOrg(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndOrg(user)
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
