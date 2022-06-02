import express from 'express'
import { createServer } from 'http'
import { ioServer } from './socket'
import cors from 'cors'

import { router as UsernameRouter } from './routes/UsernameRouter'
import { sessionMiddleware, corsConfig } from './controllers/serverController'

require('dotenv').config({ path: __dirname + '/.env'})

const app = express()
const httpServer = createServer(app)

app.use(cors(corsConfig['cors']))

app.use(express.json())
app.use(sessionMiddleware)

const io = ioServer(httpServer, corsConfig)

app.use('/api', UsernameRouter)


httpServer.listen(process.env.PORT ?? 3000, () => { console.log('Server is running...') })
