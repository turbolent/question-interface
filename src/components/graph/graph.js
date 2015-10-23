import { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styles from './graph.scss'
import d3 from 'd3'
import { hasType } from './../../model'
import { parseNode, DirectedEdge, ConjunctionNode,
    LabelNode, FilterEdge, AggregateEdge, AggregateNode } from './parse'


const SVG_REF = 'svg'


function generateShadow(x, y, blur, color) {
  let offsets = [
    ` ${x}px  ${y}px`,
    ` ${x}px -${y}px`,
    `-${x}px  ${y}px`,
    `-${x}px -${y}px`
  ]

  return offsets
      .map((offset) => offset + ` ${blur}px ${color}`)
      .join(', ')
}


// NOTE: static methods instead of instance methods, as d3 binds 'this' to DOM element

export class Graph extends Component {

  static propTypes = {
    root: PropTypes.object.isRequired
  }

  static settings = {
    size: {
      baseWidth: 140,
      baseHeight: 100
    },
    layout: {
      charge: -6000,
      friction: 0.8,
      gravity: 0.3,
      startAlpha: 0.0065
    },
    node: {
      radius: 14,
      backgroundColor: {
        getRoot() {
          return d3.hsl('#bcdd9f')
        },
        getVariable() {
          return d3.hsl('#c8e4fa')
        },
        getLabel() {
          return d3.hsl('#fde699')
        },
        getOther() {
          return d3.hsl('#ddd')
        },
        getFilter() {
          return d3.hsl('#ffc0cb')
        },
        getAggregate() {
          return d3.hsl('#CE93D8').brighter(0.5)
        }
      },
      textColor: {
        getRoot() {
          return Graph.settings.node.backgroundColor.getRoot().darker(2)
        },
        getVariable() {
          return Graph.settings.node.backgroundColor.getVariable().darker(1.4)
        },
        getConjunction() {
          return Graph.settings.node.backgroundColor.getOther().darker(2)
        },
        getLink() {
          return d3.hsl('#1e7aad')
        },
        getOther() {
          return d3.hsl('#555')
        }
      },
      stroke: {
        width: 2,
        color: {
          getRoot() {
            return Graph.settings.node.backgroundColor.getRoot().darker(1)
          },
          getVariable() {
            return Graph.settings.node.backgroundColor.getVariable().darker(0.6)
          },
          getLabel() {
            return Graph.settings.node.backgroundColor.getLabel().darker(0.6)
          },
          getAggregate() {
            return Graph.settings.node.backgroundColor.getAggregate().darker(0.4)
          },
          getOther() {
            return Graph.settings.node.backgroundColor.getOther().darker(0.4)
          }
        }
      }
    },
    edge: {
      strokeWidth: 3,
      labelOffsetX: '54%',
      labelOffsetY: -4.6,
      color: {
        getDirected() {
          return d3.hsl('#6abceb')
        },
        getFilter() {
          return Graph.settings.node.backgroundColor.getFilter().darker(0.3)
        },
        getAggregate() {
          return Graph.settings.node.backgroundColor.getAggregate().darker(0.3)
        },
        getOther() {
          return Graph.settings.node.backgroundColor.getOther().darker(0.2)
        }
      },
      textColor: {
        getLink() {
          return Graph.settings.node.textColor.getLink()
        },
        getOther() {
          return Graph.settings.node.textColor.getOther()
        }
      },
      distance: {
        getLabeled(length) {
          return Math.max(80, length * 9)
        },
        getLong() {
          return 60
        },
        getShort() {
          return 10
        }
      }
    },
    marker: {
      size: 14,
      color: {
        getFilter() {
          return Graph.settings.edge.color.getFilter()
        },
        getDirected() {
          return Graph.settings.edge.color.getDirected()
        }
      }
    },
    textShadow: {
      normal: generateShadow(2, 2, 4, 'rgba(255, 255, 255, 0.4)'),
      strong: generateShadow(2, 2, 3, 'white')
    },
    fadeInDuration: 100,
    fadeOutDuration: 100,
    secondaryDashArray: '7,2'
  }

  static adjustSizeValue(value, nodeCount, edgeCount) {
    let sizeEstimate = nodeCount + edgeCount
    return Math.round(value * (2 + 0.2 * Math.pow(sizeEstimate, 1.2)))
  }

  static getLinkDistance(d) {
    let {getLabeled, getShort, getLong} =
        Graph.settings.edge.distance
    let length = d.getLabelText().length

    if (d instanceof DirectedEdge
        || d instanceof FilterEdge)
      return getLabeled(length)

    if (d instanceof AggregateEdge)
      return getShort()

    return getLong()
  }

  static getEdgeStroke(d) {
    let {getDirected, getFilter, getOther, getAggregate} =
        Graph.settings.edge.color

    if (d instanceof DirectedEdge)
      return getDirected()

    if (d instanceof FilterEdge)
      return getFilter()

    if (d instanceof AggregateEdge)
      return getAggregate()

    return getOther()
  }

  static getEdgeStrokeDashArray(d) {
    if (d instanceof AggregateEdge
        || d instanceof FilterEdge)
      return Graph.settings.secondaryDashArray
  }

  static getNodeFill(d) {
    let {getRoot, getVariable, getLabel, getOther, getAggregate} =
        Graph.settings.node.backgroundColor

    if (d.isRoot)
      return getRoot()

    if (d instanceof LabelNode) {
      if (hasType(d.label, 'VarLabel'))
        return getVariable()

      return getLabel()
    }

    if (d instanceof AggregateNode)
    return getAggregate()

    return getOther()
  }

  static getNodeStroke(d) {
    let {getRoot, getVariable, getLabel, getOther, getAggregate} =
        Graph.settings.node.stroke.color

    if (d.isRoot)
      return getRoot()

    if (d instanceof LabelNode) {
      if (hasType(d.label, 'VarLabel'))
        return getVariable()

      return getLabel()
    }

    if (d instanceof AggregateNode)
    return getAggregate()

    return getOther()
  }

  static getNodeTextFill(d) {
    let {getRoot, getVariable, getConjunction, getLink, getOther} =
        Graph.settings.node.textColor

    if (d.isRoot)
      return getRoot()

    if (d instanceof LabelNode
        && hasType(d.label, 'VarLabel'))
      return getVariable()

    if (d instanceof ConjunctionNode)
      return getConjunction()

    if (d.getLink())
      return getLink()

    return getOther()
  }

  static getNodeTextFontWeight(d) {
    if (d instanceof LabelNode)
      return 'bold'
  }

  static getEdgeMarkerEnd(d, graph) {
    let isDirected = d instanceof DirectedEdge
    let isFilter = d instanceof FilterEdge
    if (isDirected || isFilter) {
      let type = isDirected ? 'getDirected' : 'getFilter'
      let id = graph.getMarkerId(type)
      return `url(#${id})`
    }
  }

  static getNodeTextShadow(d) {
    let {normal, strong} =
        Graph.settings.textShadow

    if (d instanceof LabelNode
        && !hasType(d.label, 'VarLabel'))
      return strong

    return normal
  }

  static linkify(d) {
    let link = d.getLink()

    if (!link)
      return

    let element = document.createElementNS('http://www.w3.org/2000/svg', 'a')
    d3.select(element)
        .attr({
          'xlink:show': 'new',
          'xlink:href': link
        })

    let parent = this.parentNode
    parent.appendChild(element)
    element.appendChild(this)
  }

  static getEdgeLabelFill(d) {
    let {getLink, getOther} =
        Graph.settings.edge.textColor

    if (d.getLink())
      return getLink()

    return getOther()
  }

  static addMarker(selection, id, type) {
    let {size, color} = Graph.settings.marker
    let colorFactory = color[type]

    selection.append('marker')
        .attr({
          id: id,
          viewBox: '0 -5 10 10',
          markerWidth: size,
          markerHeight: size,
          orient: 'auto',
          markerUnits: 'userSpaceOnUse'
        })
        .append('path')
        .attr({
          d: 'M0,-5L10,0L0,5',
          fill: colorFactory()
        })
  }

  static getLinkOffset(d) {
    if (!(d instanceof DirectedEdge)
        && !(d instanceof FilterEdge))
    {
      return [0, 0]
    }

    let diffX = d.target.x - d.source.x
    let diffY = d.target.y - d.source.y

    let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY))

    let {settings} = Graph
    let offset = settings.node.radius
                 + settings.marker.size

    return [(diffX * offset) / pathLength,
            (diffY * offset) / pathLength]
  }

  static getNextId = (function () {
    var nextId = 0
    return () => nextId++
  })()

  constructor() {
    super()
    this.id = Graph.getNextId()
  }

  componentDidMount() {
    this.createForce()

    this.update(this.props.root)
    this.start()
  }

  shouldComponentUpdate(nextProps) {
    let {root} = nextProps

    // skip update if still rendering same node
    if (root === this.props.root)
      return false

    // fade out, clear, update, start (fades in)
    let graph = this
    let svg = d3.select(this.getSVGElement())
    svg.transition()
        .duration(Graph.settings.fadeOutDuration)
        .style('opacity', 0)
        .each('end',
              function () {
                if (graph.unmounted)
                  return

                svg.selectAll('*').remove()

                graph.update(root)
                graph.start()
              })

    return false
  }

  componentWillUnmount() {
    this.force.on('tick', null)
    this.unmounted = true
  }

  createForce() {
    let {charge, friction, gravity} = Graph.settings.layout

    let graph = this
    this.force = d3.layout.force()
        .charge(charge)
        .friction(friction)
        .gravity(gravity)
        .linkDistance(Graph.getLinkDistance)
        .on('tick',
            function () {
              graph.layoutNodes()
              graph.layoutEdges()
              graph.layoutLabels()
            })
  }

  layoutNodes() {
    this.nodeSelection.attr('transform', function (d) {
      return `translate(${d.x}, ${d.y})`
    })
  }

  layoutEdges() {
    this.edgeSelection.attr('d', function (d) {
      let [offsetX, offsetY] = Graph.getLinkOffset(d)
      return 'M' + [d.source.x, d.source.y].join(',')
             + 'L' + [d.target.x - offsetX, d.target.y - offsetY].join(',')
    })
  }

  layoutLabels() {
    this.labelSelection.attr('transform', function (d) {
      if (d.target.x < d.source.x) {
        let bbox = this.getBBox()
        let rx = bbox.x + bbox.width / 2
        let ry = bbox.y + bbox.height / 2
        return `rotate(180 ${rx} ${ry})`
      }

      return 'rotate(0)'
    })
  }

  getEdgePathIdentifier(i) {
    return `edgepath-${this.id}-${i}`
  }

  addNodes(nodes) {
    this.force.nodes(nodes)

    let svg = d3.select(this.getSVGElement())
    this.nodeSelection = svg.selectAll(styles.node).data(nodes)

    let newNodes = this.nodeSelection
        .enter()
        .append('g')
        .attr('class', styles.node)
        .call(this.force.drag)

    let {radius, stroke} = Graph.settings.node

    newNodes.append('circle')
        .attr({
          r: radius,
          fill: Graph.getNodeFill,
          'stroke-width': stroke.width,
          stroke: Graph.getNodeStroke
        })

    newNodes.append('text')
        .attr({
          fill: Graph.getNodeTextFill,
          'font-weight': Graph.getNodeTextFontWeight
        })
        .style('text-shadow', Graph.getNodeTextShadow)
        .text(d => d.getLabelText())
        .each(Graph.linkify)
  }

  addEdges(edges) {
    this.force.links(edges)

    let {strokeWidth} = Graph.settings.edge

    let graph = this

    let svg = d3.select(this.getSVGElement())
    this.edgeSelection = svg.selectAll(styles.edge).data(edges)

    this.edgeSelection
        .enter()
        .append('path')
        .attr({
          id: (d, i) => graph.getEdgePathIdentifier(i),
          class: styles.edge,
          'stroke-width': strokeWidth,
          'marker-end': d => Graph.getEdgeMarkerEnd(d, graph),
          stroke: Graph.getEdgeStroke,
          'stroke-dasharray': Graph.getEdgeStrokeDashArray
        })
  }

  addEdgeLabels(edges) {
    let graph = this

    let {labelOffsetX, labelOffsetY} = Graph.settings.edge

    let svg = d3.select(this.getSVGElement())
    this.labelSelection = svg.selectAll(styles.edgeLabel).data(edges)

    let labels = this.labelSelection
        .enter()
        .append('text')
        .attr({
          class: styles.edgeLabel,
          'dy': labelOffsetY,
          'font-weight': 'bold',
          fill: Graph.getEdgeLabelFill
        })
        .each(Graph.linkify)

    labels.append('textPath')
        .attr({
          'xlink:href': (d, i) => '#' + graph.getEdgePathIdentifier(i),
          startOffset: labelOffsetX
        })
        .style({
          'pointer-events': 'none'
        })
        .text(d => d.getLabelText())
  }

  getMarkerId(type) {
    return `end-arrow-${this.id}-${type}`
  }

  updateSize(nodes, edges) {
    let nodeCount = nodes.length
    let edgeCount = edges.length
    let {baseWidth, baseHeight} = Graph.settings.size
    let width = Graph.adjustSizeValue(baseWidth, nodeCount, edgeCount)
    let height = Graph.adjustSizeValue(baseHeight, nodeCount, edgeCount)

    d3.select(this.getSVGElement())
        .attr({
          width: width,
          height: height
        })

    this.force.size([width, height])
  }

  addMarkers() {
    let svg = d3.select(this.getSVGElement())
    let {color} = Graph.settings.marker
    Object.keys(color)
        .forEach(type => {
                       let id = this.getMarkerId(type)
                       Graph.addMarker(svg, id, type)
                     })
  }

  update(root) {
    let [nodes, edges] = parseNode(root)
    nodes[0].isRoot = true

    this.updateSize(nodes, edges)
    this.addMarkers()
    this.addEdges(edges)
    this.addNodes(nodes)
    this.addEdgeLabels(edges)
  }

  start() {
    // accelerate force layout and fade in once layout has settled

    var started = false

    let svg = d3.select(this.getSVGElement())
    svg.style('opacity', 0)

    let {fadeInDuration} = Graph.settings
    this.force.on('end', function () {
      if (started)
        return
      started = true

      svg.transition()
          .duration(fadeInDuration)
          .style('opacity', 1)
    })

    this.force.start()

    let {startAlpha} = Graph.settings.layout
    this.forwardAlpha(startAlpha)
  }

  forwardAlpha(alpha = 0, max = 1000) {
    let {force} = this
    for (var i = 0; force.alpha() > alpha && i < max; i++)
      force.tick()
  }

  getSVGElement() {
    return ReactDOM.findDOMNode(this.refs[SVG_REF])
  }

  render() {
    return <div className={styles.graph}>
      <div className={styles.border}>
        <svg ref={SVG_REF} />
      </div>
    </div>
  }

}
