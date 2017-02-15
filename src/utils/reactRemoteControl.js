import React from 'react';
import ReactDOM from 'react-dom';
import Shortid from 'shortid';

export default class ReactRemoteControl {
  container = false;
  wrapper = false;
  components = {};

  constructor (componentName) {
    this.componentName = componentName;
    this.renderWrap();
  }

  show = (whereRenderClass, props = {}, wrapper = false) => {
    this.container = document.querySelector(whereRenderClass);

    /* if wrapper is undefined */
    if (!document.getElementsByClassName(`${this.componentName.toLowerCase()}-component-wrapper`).length) {
      this.insertAfter(this.wrapper.nodeElement, this.container);
    } else {
      return false;
    }

    // add callback for remove component
    props.afterRemoveDomNode = () => {
      document.getElementById(this.wrapper.id).remove();
    };

    let Component = this.components[this.componentName];

    ReactDOM.render(<Component  {...props} />,
      this.wrapper.nodeElement
    );
    return {
      props
    };
  };

  update = (props = {}) => {
    let Component = this.components[this.componentName];
    if (this.container) {
      ReactDOM.render(<Component  {...props}/>,
        this.wrapper.nodeElement
      );
    } else {
      return `Component "${this.componentName}" is undefined`;
    }
  };

  renderWrap = () => {
    let nodeElement = document.createElement('div');
    let componentName = this.componentName.toLowerCase();
    let id = `${componentName}_${Shortid.generate()}`;
    nodeElement.id = id;
    nodeElement.className = `react-component ${componentName}-component-wrapper`;
    this.wrapper = {
      nodeElement,
      id
    };
  };

  insertAfter = (newNode, referenceNode) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
}
