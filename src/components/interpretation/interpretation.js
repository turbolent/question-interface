import { Component, PropTypes } from 'react'
import { Section } from './../section/section'
import { Failure } from './../failure/failure'
import { Tokens } from './../tokens/tokens'
import { Tree } from './../tree/tree'
import { Graph } from './../graph/graph'
import { Query } from './../query/query'


export class Interpretation extends Component {

  static propTypes = {
    result: PropTypes.object.isRequired
  };

  render() {
    let {result} = this.props

    let tokens
    if (result.tokens) {
      tokens = <Section title="Tokens">
        <Tokens tokens={result.tokens} />
      </Section>
    }

    let question
    if (result.question) {
      question = <Section title="Question">
        <Tree root={result.question} />
      </Section>
    }

    let nodes
    if (result.nodes) {
      nodes = <Section title="Nodes">
        {result.nodes.map((node, index) =>
                              <Graph root={node} key={index} />)}
      </Section>
    }

    let queries
    if (result.queries) {
      queries = <Section title="Queries">
        {result.queries.map((query, index) =>
                                <Query query={query} key={index} />)}
      </Section>
    }

    let error
    if (result.error) {
      error = <Section title="Error">
        <Failure message={result.error} isRaw={true} />
      </Section>
    }

    return <div>
      {error}
      {queries}
      {nodes}
      {question}
      {tokens}
    </div>
  }
}