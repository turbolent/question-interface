

const identity = (x) => x

export function diff(original, target, keyFunction) {
  keyFunction = keyFunction || identity

  const removed = []
  const added = []
  const moved = {}

  const originalMap = new Map()
  original.forEach((item, index) => {
    const key = keyFunction(item)
    originalMap.set(key, index)
  })

  const targetMap = new Map()
  target.forEach((item, index) => {
    const key = keyFunction(item)
    targetMap.set(key, index)

    const originalIndex = originalMap.get(key)
    if (originalIndex === undefined)
      added.push(index)
  })

  original.forEach((item, index) => {
    const key = keyFunction(item)
    const targetIndex = targetMap.get(key)
    if (targetIndex === undefined)
      removed.push(index)
    else if (targetIndex != index)
      moved[index] = targetIndex
  })

  return [removed, added, moved]
}