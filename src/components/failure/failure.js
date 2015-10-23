import { Component, PropTypes } from 'react'
import styles from './failure.scss'


export class Failure extends Component {

  static propTypes = {
    message: PropTypes.string.isRequired,
    isRaw: PropTypes.bool
  }

  static defaultProps = {
    isRaw: false
  }

  render() {
    let {message, isRaw} = this.props
    let className = isRaw
        ? styles.rawFailure
        : styles.failure
    return <div className={className}>
      {message}
    </div>
  }

}