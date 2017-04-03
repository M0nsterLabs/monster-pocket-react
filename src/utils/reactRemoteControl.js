import React from 'react';
import ReactDOM from 'react-dom';
import Shortid from 'shortid';
import i18n from '../i18n/';
window.Promise = require('bluebird');

export default class ReactRemoteControl {
  container = false;
  wrapper = false;
  components = {};

  constructor (componentName, locale = 'en', path = '.') {
    this.componentName = componentName;
    this.locale = locale;
    this.path = path;
    console.log('123132123', 123132123);
    this.renderWrap();
    console.log('12313212dfhsgfhdgfhdghdfghdfghdfg');
  }

  show = (whereRenderClass, props = {}) => {
    console.log('0');
    this.container = document.querySelector(whereRenderClass);

    /* if wrapper is undefined */
    if (!document.getElementsByClassName(`${this.componentName.toLowerCase()}-component-wrapper`).length) {
      this.insertAfter(this.wrapper.nodeElement, this.container);
    } else {
      return false;
    }
    console.log('1');
    // add callback for remove component
    props.afterRemoveDomNode = () => {
      if (typeof props.afterClose === 'function') {
        props.afterClose();
      }
      const node = document.getElementById(this.wrapper.id);
      node.parentNode.removeChild(node);
    };
    console.log('2');
    const Component = this.components[this.componentName];
    console.log('3');
    const localeService = new i18n.Factory(this.locale, this.path);
    console.log('4');
    localeService.whenLocaleIsLoaded(provider => {
      console.log('5');
      ReactDOM.render(
        <i18n.Provider i18n={provider}>
          <Component  {...props} />
        </i18n.Provider>,
        this.wrapper.nodeElement
      );
      return {
        props
      };
    });
  };

  update = (props = {}) => {
    let Component = this.components[this.componentName];
    if (this.container) {
      const localeService = new i18n.Factory(this.locale);
      localeService.whenLocaleIsLoaded(provider => {
        ReactDOM.render(
          <i18n.Provider i18n={provider}>
            <Component  {...props}/>
          </i18n.Provider>,
          this.wrapper.nodeElement
        );
      });
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
  };
}
