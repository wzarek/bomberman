import { Outlet, Navigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import { AuthContext } from './AuthProvider'


const ProtectedRoute = () => {
    const useAuth = () => {
        const { user } = useContext(AuthContext)

        return user && user.username
    }

    const isAuth = useAuth()

    return isAuth ? <Outlet /> : <Navigate to='/' />
}

export { ProtectedRoute }