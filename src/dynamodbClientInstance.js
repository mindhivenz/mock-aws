/* eslint-disable no-console */

import DynamoDb from 'aws-sdk/clients/dynamodb'
import { Credentials } from 'aws-sdk/global'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

import { SINGLE_INSTANCE_PORT } from './dynamodbConst'
import { checkPortInUse, freePort } from './ports'
import startDynamodbLocal from './startDynamodbLocal'
import ddblhConfig from 'dynamodb-localhost/dynamodb/config'
import ddblhUtils from 'dynamodb-localhost/dynamodb/utils'


const testPath = path.join(ddblhUtils.absPath(ddblhConfig.setup.install_path), ddblhConfig.setup.jar)
const fileExists = promisify(fs.exists)

const clientFactory = port =>
  new DynamoDb({
    region: 'localhost',
    endpoint: `http://localhost:${port}`,
    credentials: new Credentials('dummyKey', 'dummySecret'),
  })

const instancePromise = new Promise(async (resolve, reject) => {
  try {
    const singleInstance = await checkPortInUse(SINGLE_INSTANCE_PORT)
    if (singleInstance) {
      console.log(`Using existing dynamodb-local instance on ${SINGLE_INSTANCE_PORT}`)
      resolve(clientFactory(SINGLE_INSTANCE_PORT))
    } else {
      if (! await fileExists(testPath)) {
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
