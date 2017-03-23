import React from 'react';
import ReactDOM from 'react-dom';
import Shortid from 'shortid';
import i18n from '../i18n/';

export default class ReactRemoteControl {
  container = false;
  wrapper = false;
  components = {};

  constructor (componentName, locale = 'en', path = '.') {
    this.componentName = componentName;
    this.locale = locale;
    this.path = path;
    this.renderWrap();
  }

  show = (whereRenderClass, props = {}) => {
    this.container = document.querySelector(whereRenderClass);

    /* if wrapper is undefined */
    if (!document.getElementsByClassName(`${this.componentName.toLowerCase()}-component-wrapper`).length) {
      this.insertAfter(this.wrapper.nodeElement, this.container);
    } else {
      return false;
    }

    // add callback for remove component
    props.afterRemoveDomNode = () => {
      if (typeof props.afterClose === 'function') {
        props.afterClose();
      }
      const node = document.getElementById(this.wrapper.id);
      node.parentNode.removeChild(node);
    };

    const Component = this.components[this.componentName];
    const localeService = new i18n.Factory(this.locale, this.path);
    localeService.whenLocaleIsLoaded(provider => {
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
