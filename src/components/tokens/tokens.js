import { Component, PropTypes } from 'react'
import { Token } from './../token/token.js'
import styles from './tokens.scss'


export class Tokens extends Component {

  static propTypes = {
    tokens: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render() {
    let {tokens} = this.props
    return <div className={styles.tokens}>
      {tokens.map((token, index) =>
                      <Token token={token} key={index} />)}
    </div>
  }

}