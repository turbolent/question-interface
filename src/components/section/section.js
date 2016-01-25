import { Component, PropTypes } from 'react'
import styles from './section.scss'


export class Section extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  };

  render() {
    let {children, title} = this.props
    return <div className={styles.section}>
      <h2>{title}</h2>
      {children}
    </div>
  }

}