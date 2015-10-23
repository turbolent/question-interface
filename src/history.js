export function encodeSentence(sentence) {
  return '#' + encodeURIComponent(sentence.trim())
}

export function getSavedSentence() {
  let hash = window.location.hash
  return hash.length
      ? decodeURIComponent(hash.substring(1))
      : ''
}
