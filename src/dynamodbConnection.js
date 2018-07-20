import net from 'net'
import DynamoDb from 'aws-sdk/clients/dynamodb'
import { Credentials } from 'aws-sdk/global'

const IPV4_LOCALHOST = '127.0.0.1'  // Has to be IPv4

export const clientFactory = (port, options = {}) =>
  new DynamoDb({
    region: 'localhost',
    endpoint: `http://${IPV4_LOCALHOST}:${port}`,
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
