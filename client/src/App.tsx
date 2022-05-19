import React from 'react'
import Dashboard from './components/Dashboard'
import { io } from 'socket.io-client'
import './static/css/style.css'

const socket = io('http://localhost:3000')

function App() {
  return (
    <div className="App">
      <Dashboard socket={socket} />
    </div>
  )
}

export default App
