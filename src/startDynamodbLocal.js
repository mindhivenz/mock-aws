import dynamodbLocal from 'dynamodb-localhost'
import sleep from 'sleep-promise'
import { serverExists } from './dynamodbConnection'


export default async (port) => {
  dynamodbLocal.start({
    port,
    delayTransientStatuses: false,
  })
  process.on('exit', () => {
    dynamodbLocal.stop(port)
  })
  while (! await serverExists(port)) {
    await sleep(100)
  }
}
