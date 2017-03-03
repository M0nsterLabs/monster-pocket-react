import React from 'react';
import ReactDOM from 'react-dom';
import Shortid from 'shortid';
import i18n from '../i18n/';

export default class ReactRemoteControl {
  container = false;
  wrapper = false;
  components = {};

  constructor (componentName, locale = 'en') {
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

    const Component = this.components[this.componentName];
    const localeService = new i18n.Factory('en');
    localeService.whenLocaleIsLoaded(function (provider) {
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
      const localeService = new i18n.Factory('en');
      localeService.whenLocaleIsLoaded(function (provider) {
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
