import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import config from 'dynamodb-localhost/dynamodb/config'
import utils from 'dynamodb-localhost/dynamodb/utils'

const fileExists = promisify(fs.exists)

const testPath = path.join(utils.absPath(config.setup.install_path), config.setup.jar)

export const isInstalled = async () =>
  await fileExists(testPath)
