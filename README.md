# Mock AWS

## Mocking AWS API calls using Sinon

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

The methods will validate the passed parameters against the
 'schema' AWS has catching errors early.

```js
import S3 from 'aws-sdk/clients/s3'
import { mockService } from '@mindhive/mock-aws'

const s3 = mockService(S3, ['getObject', 'putObject'])
const image = some.image()
s3.getObject.request.withArgs(sinon.match({ Key: expectedKey }))
  .returnsValue({ Body: image })
const result = await s3.getObject(params).promise()
s3.getObject.should.have.been.calledOnce
result.Body.should.equal(image)
```

## Testing against DynamoDB

This package installs a `bin` script `dynamodb-local-install` which
will download AWS's [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).
This is stored within `node_modules` so you will need to reinstall
should the package be updated.
Then you can start a copy of the local server and get a DynamoDB
client pointing to that server with `dynamodbClientInstance`.
The instance is created on a free port so you can run tests in
parallell across multiple instances of Node.

`givenTableCreated` will ensure the table is setup as per the given
properties and empty.
As `createTable` and `deleteTable` can be slow with
the local server it will empty the table in a batch operation if the
table properties have not changed.

Example:
```js
import dynamodbDriver from '@mindhive/mock-aws/dynamodbClientInstance'
import givenTableCreated from '@mindhive/mock-aws/givenTableCreated'
import DynamoDb from 'aws-sdk/clients/dynamodb'

let dynamodb
before(async () => {  // This can be put in a separate module imported by all tests
  dynamodb = await dynamodbClientInstance()
})

describe('suite', () => {
  it('should work with DynamoDB table', async () => {
    await givenTableCreated({
      TableName: 'foo',
      ...  // As per DynamoDB.createTable in the AWS SDK
    })
    const docClient = new DynamoDb.DocumentClient({ service: dynamodbDriver })
    await docClient.put({...}).promise()
    ...
  })
})
```

### Table definition from CloudFormation template

You can load the DynamoDB table definition directly from your
CloudFomration template ensuring your tests match your production setup.

```js
import givenTableCreated from '@mindhive/mock-aws/givenTableCreated'
import loadCfnYaml from '@mindhive/mock-aws/loadCfnYaml'

const template = loadCfnYaml('resources.cfn.yaml')
await givenTableCreated(template.Resources['FooTable'].Properties)
```

This will also handle some of the differences between `AWS::DynamoDB::Table`
`Properties` and the properties required by the SDK to create a table.

### Single DynamoDB Local instance

Alternatively you can call the bin script `dynamodb-local` which downloads
the server (if not downloaded already) and starts the local server on
the (fixed) standard port. `dynamodbClientInstance` will look on that
port first and use it if it exists.
