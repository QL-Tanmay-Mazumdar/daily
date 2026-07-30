import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import debug from 'debug'
import http from 'http'

import { checkDatabaseConnection, db } from './db'
import routes from './routes'

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(import.meta.dirname, 'public')))

app.use('/api', routes)

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

const normalizePort = (val) => {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

const dbg = debug('daily:server')

const onListening = () => {
  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
  console.log('Listening on ' + bind)
}

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port);

const server = http.createServer(app)

const start = async () => {
  const dbVersion = await checkDatabaseConnection()
  console.log(`Connected to ${dbVersion}`)

  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}

const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down`)
  await db.destroy()
  process.exit(0)
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

void start().catch((error) => {
  console.error('Unable to connect to PostgreSQL', error)
  process.exit(1)
})
