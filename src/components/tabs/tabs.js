import { Component, PropTypes } from 'react'
import styles from './tabs.scss'


export class Tabs extends Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    activeItem: PropTypes.number,
    onSelection: PropTypes.func
  }

  static defaultProps = {
    activeItem: 0
  }

  handleClick(i) {
    let {onSelection} = this.props
    if (onSelection)
      onSelection(i)
  }

  render() {
    let {items, activeItem} = this.props
    return <div className={styles.tabs}>
      {items.map((item, i) => {
        let className = (i == activeItem
            ? styles.activeTab
            : styles.tab)
        return <div className={className} key={i} onClick={this.handleClick.bind(this, i)}>
          {item}
        </div>
      })}

    </div>
  }
}
