const QUERY_BASE = 'http://query.wikidata.org/'
const WIKI_BASE = 'http://wikidata.org/wiki/'

export function getWikidataPropertyURL(id) {
  return WIKI_BASE + 'Property:P' + id
}

export function getWikidataItemURL(id) {
  return WIKI_BASE + 'Q' + id
}

export function getWikidataQueryURL(query) {
  return QUERY_BASE + '#' + encodeURIComponent(query)
}