import fs from 'fs'
import yaml from 'js-yaml'


const noOpScalarYamlType = {
  kind: 'scalar',
  construct() {
    return null
  },
}

const noOpSequenceYamlType = {
  kind: 'sequence',
  construct() {
    return null
  },
}

const noOpSchema = yaml.Schema.create([
  ...['!Sub', '!Ref', '!GetAtt'].map(t => new yaml.Type(t, noOpScalarYamlType)),
  ...['!If', '!Sub', '!Equals'].map(t => new yaml.Type(t, noOpSequenceYamlType)),
])

export default path => yaml.safeLoad(
  fs.readFileSync(path, 'utf8'),
  { schema: noOpSchema },
)
