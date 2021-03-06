import deepEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import fromPairs from 'lodash/fromPairs'

import dynamodbClientInstance from './dynamodbClientInstance'


const matchProps = ['AttributeDefinitions', 'KeySchema']

export default async (tableProperties) => {
  if (! tableProperties.TableName) {
    throw new Error('If you are using a CloudFormation generated TableName you need to Output it and pass it in')
  }
  const client = await dynamodbClientInstance()
  const tableNameProp = { TableName: tableProperties.TableName }
  let existing = null
  try {
    existing = await client.describeTable(tableNameProp).promise()  // Try this first, as deleting a non-exiting table fills log with errors
  } catch (e) {
    if (e.code !== 'ResourceNotFoundException') {
      throw e
    }
  }
  if (existing) {
    if (deepEqual(pick(existing.Table, matchProps), pick(tableProperties, matchProps))) {
      // Just empty it
      const keyAttributesNames = existing.Table.KeySchema.map(s => s.AttributeName)
      const expressionAttributeNames = fromPairs(keyAttributesNames.map((a, i) => [`#A${i}`, a]))
      const scanParams = {
        ...tableNameProp,
        ExpressionAttributeNames: expressionAttributeNames,
        ProjectionExpression: Object.keys(expressionAttributeNames).join(', '),
      }
      let scanRequest = await client.scan(scanParams)
      let scanResponse = null
      const captureResponse = (response) => {
        scanResponse = response
      }
      do {
        scanRequest.on('success', captureResponse)
        const scan = await scanRequest.promise()
        if (! scan.Items.length) {
          return
        }
        await client.batchWriteItem({
          RequestItems: {
            [tableNameProp.TableName]: scan.Items.map(k => ({
              DeleteRequest: { Key: k }
            }))
          }
        }).promise()
        scanRequest = scanResponse.nextPage()
      } while (scanRequest)
    } else {
      console.log('Reverting to delete as table properties have changed')
      // Have to delete, this can be slow with DynamoDB local
      await client.deleteTable(tableNameProp).promise()
    }
  } else {
    const { PointInTimeRecoverySpecification: ignore, ...createProps } = tableProperties
    if (createProps.StreamSpecification && ! ('StreamEnabled' in createProps.StreamSpecification)) {  // This is needed by the SDK, but not in CloudFormation
      createProps.StreamSpecification.StreamEnabled = true
    }
    await client.createTable(createProps).promise()
  }
}
