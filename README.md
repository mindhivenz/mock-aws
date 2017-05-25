# Mock AWS

## Mocking AWS API calls

Use either `mockService` to mock an entire service, or `mockMethod` 
 to mock just a single method. Both take the AWS service class 
 (e.g. what you get from `import S3 from 'aws-sdk/clients/s3'`)
 and the method names/name you want mocked. Optionally you can set
 the specific API version you want, it will default to the latest.

The resulting methods are `sinon.spy`s. You can use them in the
 usual way in your spec/test assertions. The method also has a property
`request`. This is a `sinon.stub`. Use it as usual to specify 
 the return value. If you want your test to be asynchronous and
 pause on the method call then use a `Promise` as the return value
 and resolve it later. 

The methods will also validate the passed parameters against the
 'schema' AWS has catching errors early.

```js
import S3 from 'aws-sdk/clients/s3'
import { mockService } from '@mindhive/mock-aws'

const s3 = mockService(S3, ['getObject', 'putObject'])
s3.getObject.request.withArgs(sinon.match({ Key: expectedKey }))
  .returnsValue({ Body: image })

s3.getObject.should.have.been.calledOnce
```

## Testing against DynamoDB

This package installs a `bin` script `dynamodb-local` to start a 
local DynamoDB. The first time this will download and install the 
AWS local DynamoDB under: 
`/node_modules/dynamodb-localhost/dynamodb/bin`. 

Then in your test code:
```js
import dynamodbDriver from '@mindhive/mock-aws/dynamodb-driver'
import DynamoDb from 'aws-sdk/clients/dynamodb'

await dynamodbDriver.createTable({
  TableName: 'Users',
  ...
}).promise()
  
const docClient = new DynamoDb.DocumentClient({ service: dynamodbDriver })  
```
