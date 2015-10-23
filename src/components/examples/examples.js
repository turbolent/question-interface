import { Component, PropTypes } from 'react'
import styles from './examples.scss'
import { encodeSentence } from './../../history'
import { EXAMPLES } from './data'


export class Examples extends Component {

  constructor() {
    super()
    this.handleToggle = this.handleToggle.bind(this)

    this.state = {
      collapsed: true
    }
  }

  handleToggle() {
    this.setState({collapsed: !this.state.collapsed})
  }

  makeItem(example, i) {
    return <li className={styles.item} key={i}>
      <a href={encodeSentence(example)}>{example}</a>
    </li>
  }

  render() {
    let {collapsed} = this.state
    let listStyle = collapsed
        ? styles.listCollapsed
        : styles.list
    return <div className={styles.examples}>
      <div className={styles.toggle} onClick={this.handleToggle}>
        <div className={styles.icon} />
        Examples
      </div>
      <ul className={listStyle}>
        {EXAMPLES.map((example, i) =>
                          this.makeItem(example, i))}
      </ul>
    </div>
  }
}