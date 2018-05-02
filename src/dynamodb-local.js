#!/usr/bin/env node

import dynamodbLocal from 'dynamodb-localhost'
import { SINGLE_INSTANCE_PORT } from './dynamodbConst'
import { checkPortInUse } from './ports'
import startDynamodbLocal from './startDynamodbLocal'

/* eslint-disable no-console */

checkPortInUse(SINGLE_INSTANCE_PORT)
  .then((existingInstance) => {
    if (existingInstance) {
      console.log(`Dynamodb local already started on port ${SINGLE_INSTANCE_PORT}, will use existing`)
    } else {
      dynamodbLocal.install(() => {
        startDynamodbLocal(SINGLE_INSTANCE_PORT)
      })
    }
  })
