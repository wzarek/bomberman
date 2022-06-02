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
    const [error, setError] = useState<string>('')
    const navigate = useNavigate()
    const location = useLocation()

    let link = 'https://bomberman-server.herokuapp.com/'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${link}/api/setUsername`, { credentials: 'include' })
                const data = await response.json()

                if (data && data?.username) {
                    setUser({ ...data })
                    if (location.pathname === '/') navigate('/dashboard')
                }
                setLoading(false)
            } catch (e) {
                let message = 'Unknown'
                if (e instanceof Error) message = e.message
                setError(message)
            }
        }

        fetchData()
    }, [location.pathname])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, error }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }