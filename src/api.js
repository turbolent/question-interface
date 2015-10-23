
const API_PATH = './api/parse'
const TIMEOUT = 10000
const MIN_DURATION = 0

export function request(sentence) {
  let url = new URL(API_PATH, window.location.href)
  url.search = 'sentence=' + encodeURIComponent(sentence)

  let request = new XMLHttpRequest()

  request.open('GET', url)
  request.timeout = TIMEOUT

  let promise = new Promise((resolve, reject) => {
    let start = new Date()

    request.onload = function() {
      let end = new Date()
      let duration = end - start

      let delay = Math.max(0, MIN_DURATION - duration)
      setTimeout(() => {
        if (request.status != 200) {
          let error = Error(request.statusText)
          error.dueToAbort = request.aborted
          reject(error)
          return
        }

        let json = JSON.parse(request.responseText)
        resolve(json)

      }, delay)
    }

    request.onerror = (e) => reject(Error(e))

    request.send()
  })

  promise.abort = function () {
    request.aborted = true
    request.abort()
  }

  return promise
}