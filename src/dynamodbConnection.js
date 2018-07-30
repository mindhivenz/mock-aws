import net from 'net'
import DynamoDb from 'aws-sdk/clients/dynamodb'
import { Credentials } from 'aws-sdk/global'

export const clientFactory = (port, options = {}) =>
  new DynamoDb({
    region: 'localhost',
    endpoint: `http://localhost:${port}`,
    credentials: new Credentials('dummyKey', 'dummySecret'),
    ...options,
  })

export const serverExists = async (port) => {
  const client = clientFactory(port, { maxRetries: 0 })
  try {
    await client.describeLimits().promise()
    return true
  } catch (e) {
    return false
  }
}

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
