import { getWikidataItemURL, getWikidataPropertyURL } from './../../wikidata.js'
import { getType, getValue, hasType } from './../../model.js'


//// nodes

var nextNodeId = 0

export class LabelNode {

  static labelers = {
    VarLabel(label) {
      return '?' + label.id
    },

    ItemLabel(label) {
      return label.item.name
    },

    ValueLabel(label) {
      return '"' + label.value + '"'
    },

    NumberLabel(label) {
      return label.value
    },

    TemporalLabel(label) {
      // TODO:
      return label.temporal
    }
  }

  constructor(label) {
    this.id = nextNodeId++
    this.label = label
  }

  getLabelText() {
    let {label} = this
    let type = getType(label)
    let {labelers} = LabelNode
    if (labelers.hasOwnProperty(type)) {
      let labeler = labelers[type]
      return labeler(label)
    }

    console.error('unknown node label:', label)
    return ''
  }

  getLink() {
    let {label} = this

    if (hasType(label, 'ItemLabel'))
      return getWikidataItemURL(label.item.id)
  }
}

export class ConjunctionNode {
  constructor() {
    this.id = nextNodeId++
  }

  getLabelText() {
    return '&'
  }

  getLink() {
    return undefined
  }
}

export class DisjunctionNode {
  constructor() {
    this.id = nextNodeId++
  }

  getLabelText() {
    return '|'
  }

  getLink() {
    return undefined
  }
}

export class AggregateNode {
  constructor(aggregates) {
    this.id = nextNodeId++
    this.aggregates = aggregates
  }

  getLabelText() {
    return this.aggregates.map((aggregate) => {
      let type = getType(aggregate)
      return type.substring(0, type.length - 1)
    }).join(', ')
  }

  getLink() {
    return undefined
  }
}


//// edges

class Edge {
  constructor(source, target) {
    this.source = source
    this.target = target
  }

  getLabelText() {
    return ''
  }

  getLink() {
    return undefined
  }
}

export class DirectedEdge extends Edge {
  constructor(source, target, label) {
    super(source, target)
    this.label = label
  }

  getLabelText() {
    if (hasType(this.label, 'NameLabel$'))
      return 'name'

    if (hasType(this.label, 'YearLabel$'))
      return 'year'

    return this.label.property.name
  }

  getLink() {
    if (hasType(this.label, 'PropertyLabel'))
      return getWikidataPropertyURL(this.label.property.id)
  }

}


//// filter edges

export class FilterEdge extends Edge {
}

export class LessThanFilterEdge extends FilterEdge {
  getLabelText() {
    return 'less than'
  }

}

export class GreaterThanFilterEdge extends FilterEdge {
  getLabelText() {
    return 'greater than'
  }
}


///// aggregate edge

export class AggregateEdge extends Edge {
}


//// utility

function makeParser(parsers) {
  return (value, source) => {
    let type = getType(value)
    if (parsers.hasOwnProperty(type)) {
      let parser = parsers[type]
      return parser(value, source)
    }

    return [[], []]
  }
}

//// node parsing

export function parseNode(value) {
  let {label, edge, filter, aggregates} = value

  let node = new LabelNode(label)

  let [edgeNodes, edgeEdges] = edge
      ? parseEdge(edge, node)
      : [[], []]

  let [filterNodes, filterEdges] = filter
      ? parseFilter(filter, node)
      : [[], []]

  let [aggregateNodes, aggregateEdges] =
      parseAggregates(aggregates, node)

  let allNodes = [node]
      .concat(edgeNodes)
      .concat(filterNodes)
      .concat(aggregateNodes)

  let allEdges = edgeEdges
      .concat(filterEdges)
      .concat(aggregateEdges)

  return [allNodes, allEdges]
}


//// aggregate parsing

function parseAggregates(aggregates, source) {
  if (!aggregates.length)
    return [[], []]

  let node = new AggregateNode(aggregates)
  let edge = new AggregateEdge(source, node)

  return [[node], [edge]]
}


//// filter parsing

const parseFilter = makeParser({
  LessThanFilter(value, source) {
    let [nodes, edges] = parseNode(value.node)
    let edge = new LessThanFilterEdge(source, nodes[0])
    return [nodes, [edge].concat(edges)]
  },

  GreaterThanFilter(value, source) {
    let [nodes, edges] = parseNode(value.node)
    let edge = new GreaterThanFilterEdge(source, nodes[0])
    return [nodes, [edge].concat(edges)]
  }
})


//// edge parsing

const parseEdge = makeParser({
  ConjunctionEdge(value, source) {
    let node = new ConjunctionNode()
    let edge = new Edge(source, node)
    let [nodes, edges] = parseEdges(value.edges, node)
    return [[node].concat(nodes),
            [edge].concat(edges)]
  },

  DisjunctionEdge(value, source) {
    let node = new DisjunctionNode()
    let edge = new Edge(source, node)
    let [nodes, edges] = parseEdges(value.edges, node)
    return [[node].concat(nodes),
            [edge].concat(edges)]
  },

  OutEdge(value, source) {
    let [nodes, edges] = parseNode(value.target)
    let edge = new DirectedEdge(source, nodes[0], value.label)
    return [nodes, [edge].concat(edges)]
  },

  InEdge(value, source) {
    let [nodes, edges] = parseNode(value.source)
    let edge = new DirectedEdge(nodes[0], source, value.label)
    return [nodes, [edge].concat(edges)]
  }
})

function parseEdges(edges, source) {
  return edges.reduce(([currentNodes, currentEdges], edge) => {
    let [nodes, edges] = parseEdge(edge, source)
    return [currentNodes.concat(nodes),
            currentEdges.concat(edges)]
  }, [[], []])
}
