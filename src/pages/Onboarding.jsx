import { useState } from 'react'
import { useSharedList } from '../SharedListContext'
import { useAuth } from '../AuthContext'

export default function Onboarding() {
  const { createList, list } = useSharedList()
  const { signOut } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleCreate() {
    setBusy(true)
    setError('')
    const { error } = await createList()
    if (error) setError(error.message)
    setBusy(false)
  }

  // List just created — show the code for your partner
  if (list) {
    return (
      <div className="onboarding">
        <h1>🎬 Your List Is Ready</h1>
        <p>Share this code with your partner so they can join:</p>
        <div className="join-code">{list.join_code}</div>
        <p className="hint">
          They'll sign up, then enter this code on their onboarding screen.
        </p>
        <button className="primary" onClick={() => window.location.reload()}>
          Continue to Movies
        </button>
      </div>
    )
  }

  return (
    <div className="onboarding">
      <h1>🎬 MovieApp</h1>
      <p>Let's get your shared movie list started.</p>
      <button className="primary" onClick={handleCreate} disabled={busy}>
        {busy ? 'Creating...' : 'Create Our List'}
      </button>
      {error && <p className="error">{error}</p>}
      <button className="link" onClick={signOut}>Log out</button>
    </div>
  )
}