import fromPairs from 'lodash/fromPairs'
import last from 'lodash/last'
import AWS from 'aws-sdk'
import sinon from 'sinon'


const defaultApiVersion = service => last(service.apiVersions)  // default to latest version

const loadApi = (service, version) => new AWS.Model.Api(AWS.apiLoader.services[service.serviceIdentifier][version])

export const mockMethod = (
  awsService,
  method,
  {
    apiVersion = defaultApiVersion(awsService),
    api = loadApi(awsService, apiVersion),
  } = {}
) => {
  const requestStub = sinon.stub()
  const func = sinon.spy((params, ...otherArgs) => {
    const apiOperation = api.operations && api.operations[method]
    if (apiOperation) {
      new AWS.ParamValidator(true).validate(apiOperation.input, params)
    }
    const requestResultPromisify = async () => requestStub(params, ...otherArgs)
    const promise = requestResultPromisify()
    const callback = typeof last(otherArgs) === 'function' ? last(otherArgs) : null
    if (callback) {
      promise.then(
        result => callback(null, result),
        error => callback(error),
      )
    }
    return {
      promise,
    }
  })
  func.request = requestStub
  return func
}

export const mockService = (
  awsService,
  methods,
  {
    apiVersion = defaultApiVersion(awsService),
  } = {}
) => fromPairs(methods.map(method =>
  [method, mockMethod(awsService, method, { apiVersion, api: loadApi(awsService, apiVersion) })]
))
