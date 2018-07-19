/* eslint-disable no-console */

import DynamoDb from 'aws-sdk/clients/dynamodb'

import { SINGLE_INSTANCE_PORT } from './dynamodbConst'
import { checkPortInUse, freePort } from './ports'
import startDynamodbLocal from './startDynamodbLocal'
import dynamodbLocal from 'dynamodb-localhost'


const clientFactory = port =>
  new DynamoDb({
    region: 'localhost',
    endpoint: `http://localhost:${port}`,
  })

const instancePromise = new Promise(async (resolve, reject) => {
  try {
    const singleInstance = await checkPortInUse(SINGLE_INSTANCE_PORT)
    if (singleInstance) {
      console.log(`Using existing dynamodb-local instance on ${SINGLE_INSTANCE_PORT}`)
      resolve(clientFactory(SINGLE_INSTANCE_PORT))
    } else {
      dynamodbLocal.install(async () => {
        try {
          const newPort = await freePort()
          console.log(`Starting new dynamodb-local instance on ${newPort}`)
          startDynamodbLocal(newPort)
          resolve(clientFactory(newPort))
        } catch (e) {
          reject(e)
        }
      })
    }
  } catch (e) {
    reject(e)
  }
})

export default async () => await instancePromise
