import { Outlet, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './AuthProvider'

const useAuth = () => {
    const { user } = useContext(AuthContext)

    return user && user.username
}

const ProtectedRoute = () => {
    const isAuth = useAuth()

    return isAuth ? <Outlet /> : <Navigate to='/' />
}

export { ProtectedRoute }