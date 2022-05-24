import React from 'react'
import Dashboard from './components/Dashboard'
import { io } from 'socket.io-client'
import './static/css/style.css'
import Game from './components/Game'

//const socket = io('http://localhost:3000')

function App() {
  return (
    <div className="App">
      <Game />
    </div>
  )
}

export default App
