/* eslint-disable no-console */

import { SINGLE_INSTANCE_PORT } from './dynamodbConst'
import { serverExists, clientFactory, freePort } from './dynamodbConnection'
import startDynamodbLocal from './startDynamodbLocal'
import { isInstalled } from './dynamodbLocalhost'

const instancePromise = new Promise(async (resolve, reject) => {
  try {
    const singleInstance = await serverExists(SINGLE_INSTANCE_PORT)
    if (singleInstance) {
      console.log(`Using existing dynamodb-local instance on ${SINGLE_INSTANCE_PORT}`)
      resolve(clientFactory(SINGLE_INSTANCE_PORT))
    } else {
      if (! await isInstalled()) {
        reject(new Error('You first need to run: yarn dynamodb-local-install'))
      }
      const newPort = await freePort()
      console.log(`Starting new dynamodb-local instance on ${newPort}`)
      await startDynamodbLocal(newPort)
      resolve(clientFactory(newPort))
    }
  } catch (e) {
    reject(e)
  }
})

export default async () => await instancePromise
