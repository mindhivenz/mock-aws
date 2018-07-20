import net from 'net'


export const checkPortInUse = port => new Promise((resolve) => {
  const socket = net.createConnection({ host: '127.0.0.1', port, timeout: 500 })
    .once('timeout', () => {
      socket.end()
      resolve(false)
    })
    .once('error', () => {
      socket.end()
      resolve(false)
    })
    .once('connect', () => {
      socket.end()
      resolve(true)
    })
})

export const freePort = () => new Promise((resolve, reject) => {
  const server = net.createServer()
    .once('error', (e) => {
      reject(e)
    })
    .once('listening', () => {
      const { port } = server.address()
      server.close()
      resolve(port)
    })
    .listen(0, '0.0.0.0')
})
