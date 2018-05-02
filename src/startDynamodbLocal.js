import dynamodbLocal from 'dynamodb-localhost'


export default (port) => {
  dynamodbLocal.start({
    port,
    delayTransientStatuses: false,
  })
  process.on('exit', () => {
    dynamodbLocal.stop(port)
  })
}
