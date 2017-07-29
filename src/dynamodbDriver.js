import DynamoDb from 'aws-sdk/clients/dynamodb'
import { port } from './dynamodbConst'


export default new DynamoDb({
  region: 'localhost',
  endpoint: `http://localhost:${port}`,
})
