import { useAuth } from '../AuthContext'

export default function Home() {
  const { user, signOut } = useAuth()

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', fontFamily: 'system-ui' }}>
      <h1>🎬 MovieApp</h1>
      <p>Logged in as: <strong>{user?.email}</strong></p>
      <button onClick={signOut} style={{ padding: '8px 16px', marginTop: 20 }}>
        Log Out
      </button>
      <p style={{ marginTop: 40, color: '#888' }}>
        Your movie list will go here next.
      </p>
    </div>
  )
}