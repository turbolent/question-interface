import { Component, PropTypes } from 'react'
import styles from './results.scss'
import { Section } from './../section/section'


export class Results extends Component {

  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  makeItem(result, i) {
    let {type, value} = result
    return <li key={i}>
      {type === 'uri'
          ? <a href={value} target="_blank">{value}</a>
          : value}
    </li>
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
