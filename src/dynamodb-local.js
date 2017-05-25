#!/usr/bin/env node

import net from 'net'
import dynamodbLocal from 'dynamodb-localhost'
import { port } from './dynamodb-const'

/* eslint-disable no-console */

const stopDynamodbLocal = () => {
  dynamodbLocal.stop(port)
}

const checkPortInUse = (callback) => {
  const server = net.createServer()
  server.listen(port, '0.0.0.0')
  server.on('error', (e) => {
    callback(e.code === 'EADDRINUSE' ? true : null)
  })
  server.on('listening', () => {
    server.close()
    callback(false)
  })
}

checkPortInUse((inUse) => {
  if (inUse) {
    console.log('Dynamodb local already started, will use existing')
  } else {
    dynamodbLocal.install(() => {
      dynamodbLocal.start({
        port,
        delayTransientStatuses: false,
      })
    })
  }
})

process.on('SIGINT', stopDynamodbLocal)
