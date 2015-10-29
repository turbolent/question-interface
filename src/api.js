
const PARSE_API_PATH = './api/parse'
const QUERY_API_PATH = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'


const TIMEOUT = 10000
const MIN_DURATION = 0

export function requestQueries(sentence) {
  let url = new URL(PARSE_API_PATH, window.location.href)
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

        try {
          let json = JSON.parse(request.responseText)
          resolve(json)
        } catch (e) {
          let error = Error(e)
          error.dueToAbort = false
          reject(error)
        }

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

export function requestQuery(query) {
  let url = new URL(QUERY_API_PATH, window.location.href)

  url.search = 'query=' + encodeURIComponent(query)

  let request = new XMLHttpRequest()
  request.open('GET', url)
  request.setRequestHeader('accept', 'application/sparql-results+json')
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

        try {
          let json = JSON.parse(request.responseText)
          let variable = json.head.vars[0]
          let results = json.results.bindings.map((binding) => binding[variable])
          resolve(results)
        } catch (e) {
          let error = Error(e)
          error.dueToAbort = false
          reject(error)
        }
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