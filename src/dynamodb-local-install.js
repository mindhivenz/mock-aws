#!/usr/bin/env node

import dynamodbLocal from 'dynamodb-localhost'

/* eslint-disable no-console */

dynamodbLocal.install(() => {
  console.log('Install completed, exiting')
})
