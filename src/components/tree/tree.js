import { Component, PropTypes } from 'react'
import styles from './tree.scss'
import { Subtree } from './../subtree/subtree.js'
import { getType, getValue } from './../../model'


export class Tree extends Component {

  static propTypes = {
    root: PropTypes.object.isRequired
  }

  render() {
    let {root} = this.props
    let type = getType(root)
    let value = getValue(root)
    return <div className={styles.tree}>
      <Subtree type={type} value={value} />
    </div>
  }

}