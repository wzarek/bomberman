import { useContext } from 'react'
import Dashboard from './components/Dashboard'
import UsernameForm from './components/UsernameForm'
import Room from './components/Room'
import { Routes, Route } from 'react-router-dom'
import './static/css/style.css'
import { AuthContext, AuthProvider } from './components/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  const { loading } = useContext(AuthContext)

  return (
      <Routes>
            <Route path='/' element={ <UsernameForm /> } />
            <Route element={ <ProtectedRoute /> }>
              <Route path='/dashboard' element={ <Dashboard /> } />
            </Route>
            <Route path='/room/:name' element={ <Room />}/>
            <Route path='*' />
      </Routes>
  )
}

export default App
