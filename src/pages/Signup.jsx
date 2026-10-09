import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    setBusy(true)
    const { data, error } = await signUp(email, password)
    setBusy(false)
    if (error) setError(error.message)
    else if (data.session) navigate('/')
    else setMsg('Check your email to confirm your account, then log in.')
  }

  return (
    <div style={{ maxWidth: 360, margin: '4rem auto', fontFamily: 'system-ui' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: 10 }}
        />
        <button type="submit" disabled={busy} style={{ padding: 10 }}>
          {busy ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <p>Have an account? <Link to="/login">Log in</Link></p>
    </div>
  )
}