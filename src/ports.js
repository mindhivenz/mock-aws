import net from 'net'


export const checkPortInUse = port => new Promise((resolve, reject) => {
  const server = net.createServer()
    .once('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        resolve(true)
      } else {
        reject(e)
      }
    })
    .once('listening', () => {
      server.close()
      resolve(false)
    })
    .listen(port, '0.0.0.0')
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
