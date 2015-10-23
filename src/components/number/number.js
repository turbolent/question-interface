import { Component, PropTypes } from 'react'


export class NumberComponent extends Component {
  static propTypes = {
    unit: PropTypes.object,
    value: PropTypes.number.isRequired
  }

  render() {
    let {value, unit} = this.props
    let suffix = unit
        ? `(${unit.name})`
        : ''
    return <div>{value} {suffix}</div>
  }
}
