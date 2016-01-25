import { Component, PropTypes } from 'react'
import ReactDOM  from 'react-dom'
import styles from './results.scss'
import { Section } from './../section/section'
import { CollectionView, GridLayout } from 'collection-view'
import { diff } from './diff'

export class Results extends Component {

  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  constructor(props) {
    super(props)
    this.results = []
  }

  updateResults(newResults) {
    const changes = diff(this.results, newResults, x => x.value)
    this.results = newResults
    this.view.changeIndices.apply(this.view, changes)
  }

  makeItem(result) {
    let {type, value, label} = result

    if (type === 'uri') {
      let pos = value.lastIndexOf('/')
      let key = value.substring(pos + 1)
      return <a href={value} target="_blank">{label}</a>
    }

    return <span>{label}</span>
  }

  getCount() {
    return this.results.length
  }

  configureElement(element, index) {
    element.classList.add(styles.item)
    let result = this.results[index]
    ReactDOM.render(this.makeItem(result), element)
  }

  indexRange(start, end) {
    const result = []
    for (var i = start; i <= end; i += 1)
      result.push(i)
    return result
  }

  componentDidMount() {
    const layout = new GridLayout()
    this.view = new CollectionView(this.contentElement, layout, this)
    const newResults = this.props.results
    this.updateResults(newResults)
  }

  shouldComponentUpdate(nextProps) {
    const newResults = nextProps.results

    if (newResults === this.results)
      return false

    this.updateResults(newResults)

    return false
  }

  componentWillUnmount() {
    this.view.uninstall()
  }

  render() {
    return <div className={styles.container}>
      <div className={styles.content} ref={e => this.contentElement = e}>
      </div>
    </div>
  }
}
