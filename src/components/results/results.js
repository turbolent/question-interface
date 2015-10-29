import { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import styles from './results.scss'
import transitions from './transitions.scss'
import { Section } from './../section/section'


export class Results extends Component {

  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  makeItem(result, i) {
    let {type, value} = result
    return <li key={i}>
      {type === 'uri'
          ? <a href={value} target="_blank">{value}</a>
          : value}
    </li>
  }

  render() {
    let {results} = this.props
    if (!results.length)
      return <div className={styles.note}>Hmm, nothing.</div>

    return <ReactCSSTransitionGroup
        component="ul"
        transitionName={transitions}
        className={styles.results}
        transitionAppear={true}
        transitionAppearTimeout={300}
        transitionEnterTimeout={300}
        transitionLeaveTimeout={200}
      >
      {results.map(this.makeItem)}
    </ReactCSSTransitionGroup>
  }
}
