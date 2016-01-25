import { Component, PropTypes } from 'react'
import styles from './subtree.scss'
import { Token } from './../token/token.js'
import { getType, getValue } from './../../model.js'
import { NumberComponent } from './../number/number.js'
import { getWikidataPropertyURL, getWikidataItemURL } from './../../wikidata.js'


const Link = ({type, id, name, url}) =>
    <a href={url} target="_blank">
      {type}({id}, {name})
    </a>


export class Subtree extends Component {

  static propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.any.isRequired
  };

  static leafTypes = {
    Token(value, index) {
      return <Token token={value} key={index}/>
    },

    VarLabel(value, index) {
      return <div key={index}>?{value.id}</div>
    },

    PropertyLabel(value, index) {
      let {id, name} = value.property
      let url = getWikidataPropertyURL(id)
      return <Link type="Property" id={id} name={name} url={url} key={index} />
    },

    ItemLabel(value, index) {
      let {id, name} = value.item
      let url = getWikidataItemURL(id)
      return <Link type="Item" id={id} name={name} url={url} key={index} />
    },

    ValueLabel(value, index) {
      return <div key={index}>"{value.value}"</div>
    },

    NumberLabel(value, index) {
      return <NumberComponent value={value.value} key={index}/>
    },

    NumberWithUnitLabel(value, index) {
      return <NumberComponent value={value.value} unit={value.unit} key={index}/>
    }
  };

  static makeChild(name, item, index) {
    if (Array.isArray(item))
      return <Subtree name={name} value={item} key={index} />

    let type = getType(item)
    let value = getValue(item)
    let {leafTypes} = Subtree
    if (!name && leafTypes.hasOwnProperty(type)) {
      let factory = leafTypes[type]
      return factory(value, index)
    }

    return <Subtree name={name} type={type} value={value} key={index} />
  };

  static getChildren(type, value) {
    if (Array.isArray(value))
      return value.map((item, index) =>
                           Subtree.makeChild(undefined, item, index))

    let {leafTypes} = Subtree
    if (leafTypes.hasOwnProperty(type)) {
      let factory = leafTypes[type]
      let component = factory(value, 0)
      return [component]
    }

    return Object.keys(value)
        .map((name, index) => Subtree.makeChild(name, value[name], index))
  };

  render() {
    let {name, type, value} = this.props
    let children = Subtree.getChildren(type, value)

    let nameComponent
    if (name)
      nameComponent = <div className={styles.name}>{name}</div>

    let typeComponent
    if (type)
      typeComponent = <div className={styles.type}>{type}</div>

    return <div className={styles.leaf}>
      {nameComponent}
      {typeComponent}
      <div className={styles.children}>
        {children}
      </div>
    </div>
  }
}