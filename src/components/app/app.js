import { Component, PropTypes } from 'react'
import { Header } from './../header/header'
import { Failure } from './../failure/failure'
import { Interpretation } from './../interpretation/interpretation'
import { requestQueries, requestQuery } from './../../api'
import { encodeSentence, getSavedSentence } from './../../history'
import { Tabs } from './../tabs/tabs'
import { Results } from './../results/results'
import styles from './app.scss'


const TABS = ['Results', 'Debug']


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
    this.handleTabSelection = this.handleTabSelection.bind(this)

    this.state = {
      sentence: getSavedSentence(),
      requestFailed: false,
      tabIndex: 0
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
      let newRequest = requestQueries(sentence)
      this.setState({currentRequest: newRequest})
      let result = await newRequest

      if (result.queries) {
        console.info("Got queries, now requesting result")

        // TODO: request results of all queries
        let resultsRequest = requestQuery(result.queries[0])
        this.setState({
          currentRequest: resultsRequest,
          result
        })
        let results = await resultsRequest

        this.setState({
          currentRequest: undefined,
          requestFailed: false,
          results
        })
      } else {
        // request succeeded, but didn't produce any queries
        this.setState({
          currentRequest: undefined,
          requestFailed: false,
          results: null,
          result
        })
      }
    } catch (e) {
      if (!e.dueToAbort) {
        console.error('request failed:', e)
        this.setState({
          currentRequest: undefined,
          requestFailed: true,
          result: null,
          results: null
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

  handleTabSelection(index) {
    this.setState({tabIndex: index})
  }

  styleForTab(index) {
    if (index != this.state.tabIndex)
      return {display: 'none'}
  }

  render() {
    let {result, results, requestFailed, sentence, currentRequest, tabIndex} = this.state
    let requesting = !!currentRequest
    let {placeholder} = this.props
    let header =
        <Header
            onSubmit={this.handSubmit}
            placeholder={placeholder}
            requesting={requesting}
            resultSentence={sentence}
        />

    let tabs =
        <Tabs items={TABS} activeItem={tabIndex} onSelection={this.handleTabSelection} />

    let content
    if (requestFailed)
      content = <Failure message="Request failed"/>
    else if (results)
      content = <Results results={results}/>
    else if (result && result.error)
      content = <Failure message="Hmm, no clue what that means. Maybe try something else." />

    let interpretation
    if (result)
      interpretation = <Interpretation result={result} />

    return <div>
      {header}
      {tabs}
      {[content, interpretation]
          .map((tab, i) =>
                          <div className={styles.tab} style={this.styleForTab(i)} key={i}>
                            {tab}
                          </div>)}
    </div>
  }
}
