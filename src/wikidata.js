const BASE = 'http://wikidata.org/wiki/'

export function getWikidataPropertyURL(id) {
  return BASE + 'Property:P' + id
}

export function getWikidataItemURL(id) {
  return BASE + 'Q' + id
}