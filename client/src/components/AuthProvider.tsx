import { createContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface AuthContextInterface {
    user: { [key: string]: any | boolean }
    setUser: { [key: string]: any | boolean }
    loading: boolean
}

const AuthContext = createContext<AuthContextInterface | any>(null)

const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState({ hasUsername: false })
    const [loading, setLoading] = useState<boolean>(true)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:3000/api/setUsername', { credentials: 'include' })
            const data = await response.json()

            if (data && data?.username) {
                setUser({ ...data })
                if (location.pathname === '/') navigate('/dashboard')
            }
            setLoading(false)
        }

        fetchData()
    }, [location.pathname])

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }