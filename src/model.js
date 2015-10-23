
export function getType(item) {
  let type = item['$type']
  let index = type.lastIndexOf('.')
  if (index < 0)
    return type
  return type.substring(index + 1)
}

export function getValue(item) {
  let value = Object.assign({}, item)
  delete value['$type']
  return value
}

export function hasType(value, type) {
  return getType(value) === type
}
