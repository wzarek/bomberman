import { useContext, useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import UsernameForm from './components/UsernameForm'
import Room from './components/Room'
import { Routes, Route } from 'react-router-dom'
import { AuthContext, AuthProvider } from './components/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import './static/css/style.css'
import Game from './components/Game'
import Loading from './components/Loading'
import Navbar from './components/Navbar'

interface LoadingValues {
  loading: boolean
}

function App() {
  const { loading } = useContext(AuthContext) as LoadingValues
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setLoaded(true)
      }, 500)
    }
  }, [loading])

  return (
    <>
      {!loaded ? <Loading /> :
        <>
          <Navbar />
          <Routes>
            <Route path='/' element={<UsernameForm />} />
            <Route element={<ProtectedRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
            </Route>
            <Route path='/room/:name' element={<Room />} />
            <Route path='/game/:id' element={<Game />} />
            <Route path='*' />
          </Routes>
        </>
      }
    </>
  )
}

export default App
