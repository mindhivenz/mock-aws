import dynamodbDriver from './dynamodbDriver'


export default async (tableProperties) => {
  if (! tableProperties.TableName) {
    throw new Error('If you are using a CloudFormation generated TableName you need to Output it and pass it in')
  }
  const tableNameProp = { TableName: tableProperties.TableName }
  try {
    try {
      await dynamodbDriver.deleteTable(tableNameProp).promise()
      await dynamodbDriver.waitFor('tableNotExists', tableNameProp).promise()
    } catch (ignore) {
      // ignore
    }
    const props = { ...tableProperties }
    if (props.StreamSpecification && ! ('StreamEnabled' in props.StreamSpecification)) {  // This is needed by the SDK, but not in CloudFormation
      props.StreamSpecification.StreamEnabled = true
    }
    await dynamodbDriver.createTable(props).promise()
    await dynamodbDriver.waitFor('tableExists', tableNameProp).promise()
  } catch (e) {
    console.error('Table creation failure', e)  // eslint-disable-line no-console
    throw e
  }
}
