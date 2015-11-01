import { Component, PropTypes } from 'react'
import styles from './results.scss'
import { Section } from './../section/section'


export class Results extends Component {

  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  makeItem(result, i) {
    let {type, value} = result

    if (type === 'uri') {
      let pos = value.lastIndexOf('/')
      let key = value.substring(pos + 1)
      return <li key={key}>
        <a href={value} target="_blank">{value}</a>
      </li>
    }

    return <li key={i}>{value}</li>
  }

  render() {
    let {results} = this.props
    if (!results.length)
      return <div className={styles.note}>Hmm, nothing.</div>

    return <ul className={styles.results}>
      {results.map(this.makeItem)}
    </ul>
  }
}
