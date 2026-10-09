import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

export default function Home() {
  const { user, signOut } = useAuth()
  const [movies, setMovies] = useState([])
  const [title, setTitle] = useState('')
  const [selected, setSelected] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadMovies() {
    setLoading(true)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setMovies(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadMovies()
  }, [])

  async function addMovie(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const { error } = await supabase
      .from('movies')
      .insert({ title: trimmed, user_id: user.id })
    if (!error) {
      setTitle('')
      loadMovies()
    }
  }

  async function removeMovie(id) {
    await supabase.from('movies').delete().eq('id', id)
    loadMovies()
  }

  function pickRandom() {
    if (movies.length === 0) return
    setSpinning(true)
    setSelected(null)

    let count = 0
    const totalTicks = 15 + Math.floor(Math.random() * 10)
    const interval = setInterval(() => {
      setSelected(movies[Math.floor(Math.random() * movies.length)])
      count++
      if (count >= totalTicks) {
        clearInterval(interval)
        setSpinning(false)
      }
    }, 80)
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 MovieApp</h1>
        <button onClick={signOut} className="logout">Log out</button>
      </div>

      <p className="user-line">Logged in as {user?.email}</p>

      <form onSubmit={addMovie} className="add-form">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a movie..."
        />
        <button type="submit">Add</button>
      </form>

      <div className="roulette-box">
        {selected ? (
          <div
            key={selected.id + Math.random()}
            className={`movie-card ${spinning ? 'spinning' : 'winner'}`}
          >
            {selected.title}
          </div>
        ) : (
          <div className="movie-card placeholder">
            {movies.length === 0
              ? 'Add some movies to get started'
              : 'Click below to spin'}
          </div>
        )}
        <button
          onClick={pickRandom}
          disabled={spinning || movies.length === 0}
          className="spin-btn"
        >
          {spinning ? 'Spinning...' : '🎲 Pick a Random Movie'}
        </button>
      </div>

      <ul className="movie-list">
        {loading && <p className="empty">Loading...</p>}
        {!loading && movies.length === 0 && (
          <p className="empty">No movies yet. Add one above.</p>
        )}
        {movies.map(m => (
          <li key={m.id}>
            <span>{m.title}</span>
            <button onClick={() => removeMovie(m.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}