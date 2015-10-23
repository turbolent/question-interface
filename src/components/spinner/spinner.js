import { Component, PropTypes } from 'react'
import styles from './spinner.scss'


export class Spinner extends Component {

  static propTypes = {
    active: PropTypes.bool,
    delay: PropTypes.number
  }

  static defaultProps = {
    active: false,
    delay: 500
  }

  constructor() {
    super()

    this.state = {
      spinning: false
    }
  }

  componentDidMount() {
    this.updateStateForProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.updateStateForProps(nextProps)
  }

  updateStateForProps(props) {
    let {timeout} = this
    if (timeout)
      clearTimeout(timeout)

    let {active, delay} = props
    if (active)
      this.timeout = setTimeout(() => {
        let {active: stillActive} = this.props
        if (stillActive) {
          this.setState({spinning: true})
        }
      }, delay)
    else
      this.setState({spinning: false})
  }

  render() {
    let {spinning} = this.state
    let className = spinning
        ? styles.spinnerActive
        : styles.spinner
    return <div className={className}>
      <div className={styles.dot}/>
      <div className={styles.dot}/>
      <div className={styles.dot}/>
    </div>
  }
}