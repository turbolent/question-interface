import { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styles from './header.scss'
import { Spinner } from './../spinner/spinner'
import { Examples } from './../examples/examples'


const INPUT_REF = 'input'


export class Header extends Component {

  static propTypes = {
    resultSentence: PropTypes.string,
    placeholder: PropTypes.string,
    requesting: PropTypes.bool,
    onSubmit: PropTypes.func
  };

  static defaultProps = {
    resultSentence: '',
    placeholder: '',
    onSubmit: null
  };

  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)

    this.state = {
      sentence: undefined
    }
  }

  componentWillReceiveProps(nextProps) {
    let {resultSentence} = nextProps
    if (resultSentence !== this.props.resultSentence)
      this.setState({sentence: resultSentence})
  }

  getInputElement() {
    return ReactDOM.findDOMNode(this.refs[INPUT_REF])
  }

  handleChange(event) {
    let sentence = event.target.value
    this.setState({sentence})
  }

  handleSubmit(event) {
    event.preventDefault()
    let input = this.getInputElement()
    let sentence = input.value
    let {onSubmit} = this.props
    if (onSubmit)
      onSubmit(sentence)
  }

  render() {
    let {placeholder, resultSentence, requesting} = this.props
    let {sentence} = this.state
    let value = sentence !== undefined
        ? sentence
        : resultSentence
    return <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.row}>
          <form onSubmit={this.handleSubmit}>
            <input ref={INPUT_REF} placeholder={placeholder} value={value} onChange={this.handleChange}  />
            <button type="submit">?</button>
          </form>
          <Spinner active={requesting} />
        </div>
        <div className={styles.row}>
          <Examples />
        </div>
      </div>
    </div>
  }
}
