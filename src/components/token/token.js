import { Component, PropTypes } from 'react'
import styles from './token.scss'
import d3 from 'd3'


const TAGS = ['JJ', 'NN', 'VB', 'W', 'DT', 'IN', 'POS', 'RB', 'CD', 'CC']

const SCALE = d3.scale.category20().domain(TAGS)


export class Token extends Component {

  static propTypes = {
    token: PropTypes.object.isRequired
  }

  render() {
    let {token} = this.props
    let tag = token.pennTag
    let category = TAGS.find(prefix => tag.startsWith(prefix))
    let color = SCALE(category)
    let lemmas = (token.lemmas || []).join(', ')
    return <div className={styles.token} title={lemmas}>
      <div>{token.word}</div>
      <div style={{color}}>{tag}</div>
    </div>
  }

}