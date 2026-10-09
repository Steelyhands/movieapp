import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'

const SharedListContext = createContext()

export function SharedListProvider({ children }) {
  const { user } = useAuth()
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setList(null)
      setLoading(false)
      return
    }
    loadList()
  }, [user])

  async function loadList() {
    setLoading(true)
    // Look for a list this user is a member of
    const { data, error } = await supabase
      .from('list_members')
      .select('list_id, shared_lists(id, name, join_code, created_by)')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!error && data?.shared_lists) {
      setList(data.shared_lists)
    } else {
      setList(null)
    }
    setLoading(false)
  }

  async function createList(name = 'Our Movies') {
    // Generate a friendly 6-char code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: newList, error: listErr } = await supabase
      .from('shared_lists')
      .insert({ name, join_code: code, created_by: user.id })
      .select()
      .single()

    if (listErr) return { error: listErr }

    const { error: memberErr } = await supabase
      .from('list_members')
      .insert({ list_id: newList.id, user_id: user.id })

    if (memberErr) return { error: memberErr }

    setList(newList)
    return { data: newList }
  }

  async function joinList(code) {
    const trimmed = code.trim().toUpperCase()

    // Find the list by code
    const { data: found, error: findErr } = await supabase
      .from('shared_lists')
      .select('*')
      .eq('join_code', trimmed)
      .maybeSingle()

    if (findErr || !found) {
      return { error: { message: 'No list found with that code.' } }
    }

    const { error: joinErr } = await supabase
      .from('list_members')
      .insert({ list_id: found.id, user_id: user.id })

    if (joinErr && !joinErr.message.includes('duplicate')) {
      return { error: joinErr }
    }

    setList(found)
    return { data: found }
  }

  return (
    <SharedListContext.Provider
      value={{ list, loading, createList, joinList, refresh: loadList }}
    >
      {children}
    </SharedListContext.Provider>
  )
}

export function useSharedList() {
  return useContext(SharedListContext)
}