import dynamodbLocal from 'dynamodb-localhost'
import sleep from 'sleep-promise'
import { checkPortInUse } from './ports'


export default async (port) => {
  dynamodbLocal.start({
    port,
    delayTransientStatuses: false,
  })
  process.on('exit', () => {
    dynamodbLocal.stop(port)
  })
  while (! await checkPortInUse(port)) {
    await sleep(100)
  }
}
