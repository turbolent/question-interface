import { Component, PropTypes } from 'react'
import styles from './query.scss'
import { getWikidataQueryURL } from './../../wikidata'
import Codemirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/neo.css'
import 'codemirror/mode/sparql/sparql.js'


export class Query extends Component {

  static propTypes = {
    query: PropTypes.string.isRequired,
    options: PropTypes.object
  }

  static defaultProps = {
    options: {
      mode: "application/sparql-query",
      readOnly: "nocursor",
      theme: "neo",
      lineNumbers: true
    }
  }

  render() {
    let {query, options} = this.props
    let link = getWikidataQueryURL(query)
    return <div className={styles.query}>
      <Codemirror className={styles.text} value={query} options={options} />
      <div className={styles.actions}>
        <a href={link} target="_blank">Open in Query Editor</a>
      </div>
    </div>
  }

}