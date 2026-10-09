import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { useSharedList } from '../SharedListContext'
import { searchMovies, posterUrl } from '../tmdb'

export default function Home() {
  const { user, signOut } = useAuth()
  const { list, loading: listLoading } = useSharedList()
  const navigate = useNavigate()

  const [movies, setMovies] = useState([])
  const [title, setTitle] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [loading, setLoading] = useState(true)

  // If no list, push user to onboarding
  useEffect(() => {
    if (!listLoading && !list) navigate('/onboarding')
  }, [list, listLoading, navigate])

  async function loadMovies() {
    if (!list) return
    setLoading(true)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('list_id', list.id)
      .order('created_at', { ascending: false })
    if (!error) setMovies(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadMovies()
  }, [list?.id])

  // Debounced live search
  useEffect(() => {
    const q = title.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await searchMovies(q)
        setResults(res.slice(0, 6))
      } catch (err) {
        console.error(err)
        setResults([])
      }
      setSearching(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [title])

  async function handleSubmit(e) {
    e.preventDefault()
    const q = title.trim()
    if (q.length < 2) return
    setSearching(true)
    try {
      const res = await searchMovies(q)
      setResults(res.slice(0, 6))
    } catch (err) {
      console.error(err)
      setResults([])
    }
    setSearching(false)
  }

  async function addMovieFromTmdb(movie) {
    if (!list) return
    const { error } = await supabase.from('movies').insert({
      title: movie.title,
      poster_path: movie.poster_path ?? null,
      tmdb_id: movie.id,
      user_id: user.id,
      list_id: list.id,
    })
    if (!error) {
      setTitle('')
      setResults([])
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

  if (listLoading) {
    return <div className="container"><p className="empty">Loading...</p></div>
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 {list?.name || 'MovieApp'}</h1>
        <button onClick={signOut} className="logout">Log out</button>
      </div>

      <p className="user-line">Logged in as {user?.email}</p>

      <form onSubmit={handleSubmit} className="add-form">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Search a movie title..."
        />
        <button type="submit" disabled={searching}>
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="results">
          {results.map(m => (
            <button
              key={m.id}
              onClick={() => addMovieFromTmdb(m)}
              className="result-item"
              type="button"
            >
              {m.poster_path ? (
                <img src={posterUrl(m.poster_path)} alt="" />
              ) : (
                <div className="result-no-poster">No image</div>
              )}
              <div className="result-info">
                <strong>{m.title}</strong>
                <span>{m.release_date?.slice(0, 4) || '—'}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="roulette-box">
        {selected ? (
          <div
            key={selected.id + Math.random()}
            className={`movie-card ${spinning ? 'spinning' : 'winner'}`}
          >
            {selected.poster_path && (
              <img
                src={posterUrl(selected.poster_path)}
                alt=""
                className="winner-poster"
              />
            )}
            <span>{selected.title}</span>
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
          <p className="empty">No movies yet. Search above to add one.</p>
        )}
        {movies.map(m => (
          <li key={m.id}>
            {m.poster_path && (
              <img src={posterUrl(m.poster_path)} alt="" className="list-poster" />
            )}
            <span>{m.title}</span>
            <button onClick={() => removeMovie(m.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}