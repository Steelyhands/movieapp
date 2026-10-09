import { useState } from 'react'
import { useSharedList } from '../SharedListContext'
import { useAuth } from '../AuthContext'

export default function Onboarding() {
  const { createList, joinList, list } = useSharedList()
  const { signOut } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleCreate() {
    setBusy(true)
    setError('')
    const { error } = await createList()
    if (error) setError(error.message)
    setBusy(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await joinList(code)
    if (error) setError(error.message)
    setBusy(false)
  }

  // If the list was just created, show the invite code
  if (list) {
    return (
      <div className="onboarding">
        <h1>🎬 Your List Is Ready</h1>
        <p>Share this code with your partner:</p>
        <div className="join-code">{list.join_code}</div>
        <p className="hint">
          They'll sign up, then click "Join a list" and enter this code.
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
      <p>You're not in a shared list yet.</p>

      <button className="primary" onClick={handleCreate} disabled={busy}>
        {busy ? 'Creating...' : 'Create Our List'}
      </button>

      <div className="or">or</div>

      <form onSubmit={handleJoin} className="join-form">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Enter join code"
          maxLength={6}
          required
        />
        <button type="submit" disabled={busy}>Join a List</button>
      </form>

      {error && <p className="error">{error}</p>}

      <button className="link" onClick={signOut}>Log out</button>
    </div>
  )
}