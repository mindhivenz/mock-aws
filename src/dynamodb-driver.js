import DynamoDb from 'aws-sdk/clients/dynamodb'
import { port } from './dynamodb-const'


export default new DynamoDb({
  region: 'localhost',
  endpoint: `http://localhost:${port}`,
})
