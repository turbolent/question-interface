import { Component, PropTypes } from 'react'
import { Header } from './../header/header'
import { Failure } from './../failure/failure'
import { Interpretation } from './../interpretation/interpretation'
import { request } from './../../api'
import { encodeSentence, getSavedSentence } from './../../history'


export class App extends Component {

  static propTypes = {
    placeholder: PropTypes.string
  }

  static defaultProps = {
    placeholder: '...'
  }

  constructor() {
    super()
    this.handSubmit = this.handSubmit.bind(this)
    this.handlePopState = this.handlePopState.bind(this)

    this.state = {
      sentence: getSavedSentence(),
      requestFailed: false
    }
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState)

    // load initial sentence, if any
    let {sentence} = this.state
    if (sentence !== '')
      this.requestSentence(sentence)
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState)
  }

  handSubmit(sentence) {
    if (this.state.sentence != sentence) {
      this.saveSentence(sentence)
    }

    this.setState({sentence})
    this.requestSentence(sentence)
  }

  async requestSentence(sentence) {
    let {currentRequest} = this.state
    if (currentRequest)
      currentRequest.abort()

    try {
      let newRequest = request(sentence)
      this.setState({currentRequest: newRequest})
      let result = await newRequest

      this.setState({
        currentRequest: undefined,
        requestFailed: false,
        result
      })
    } catch (e) {
      if (!e.dueToAbort) {
        console.error('request failed:', e)
        this.setState({
          currentRequest: undefined,
          requestFailed: true,
          result: null
        })
      }
    }
  }

  saveSentence(sentence) {
    let url = encodeSentence(sentence)
    history.pushState({sentence}, document.title, url)
  }

  handlePopState(event) {
    let sentence = event.state
        ? event.state.sentence
        : getSavedSentence()
    if (sentence) {
      this.setState({sentence})
      this.requestSentence(sentence)
    } else {
      this.setState({
        sentence,
        result: undefined
      })
    }
  }

  render() {
    let {result, requestFailed, sentence, currentRequest} = this.state
    let requesting = !!currentRequest
    let {placeholder} = this.props
    let header =
        <Header
            onSubmit={this.handSubmit}
            placeholder={placeholder}
            requesting={requesting}
            resultSentence={sentence}
        />

    let failure
    if (requestFailed)
      failure = <Failure message="Request failed"/>

    let interpretation
    if (result)
      interpretation = <Interpretation result={result} />

    return <div>
      {header}
      {failure}
      {interpretation}
    </div>
  }
}
