/* global describe: false, it: false, expect: false, beforeEach: false, afterEach: false, jest: false, test: false */
import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import Mascot from '../../../src/components/mascot/MascotWrapper.jsx';
let container;
let event;
const targetCoordsReturn = {
  top    : 100,
  left   : 100,
  width  : 100,
  height : 100
};
const notificationCoordsReturn = {
  top  : 120,
  left : 110
};
beforeEach(() => {
  jest.useFakeTimers();
  container = document.createElement('div');
  event = new Event('animationend');
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
});

describe('Snapshots:', () => {
  test('free mascot wrapper', () => {
    const component = mount(<Mascot text="free mascot wrapper" timeout={0}/>);
    component.node.trigger.getTargetCoords = jest.fn(() => {
      return targetCoordsReturn;
    });
    component.node.trigger.calcNotificationCoords = jest.fn(() => {
      return notificationCoordsReturn;
    });
    const mascotNodeElement = ReactDOM.findDOMNode(component.node.trigger.target.domNode).getElementsByClassName('mascot')[0];
    mascotNodeElement.dispatchEvent(event);
    expect(component.html()).toMatchSnapshot();
  });

  test('free mascot wrapper with hide', () => {
    const component = mount(<Mascot text="free mascot wrapper with hide" timeout={0}/>);
    component.node.trigger.getTargetCoords = jest.fn(() => {
      return targetCoordsReturn;
    });
    component.node.trigger.calcNotificationCoords = jest.fn(() => {
      return notificationCoordsReturn;
    });

    component.setState({'hide': true});
    component.node.trigger.target.domNode.dispatchEvent(event);
    expect(component.node.status.umounted).toBe(true);
  });

  test('free mascot wrapper without hide', () => {
    const component = mount(<Mascot text="free mascot wrapper without hide" timeout={0}/>);
    component.node.trigger.getTargetCoords = jest.fn(() => {
      return targetCoordsReturn;
    });
    component.node.trigger.calcNotificationCoords = jest.fn(() => {
      return notificationCoordsReturn;
    });

    component.setState({'hide': false});
    component.node.trigger.target.domNode.dispatchEvent(event);
    expect(component.node.status.umounted).toBe(false);
  });

  test('free mascot wrapper with timer', async () => {
    const component = mount(<Mascot text="free mascot wrapper with timer" timeout={4000}/>);
    component.node.trigger.getTargetCoords = jest.fn(() => {
      return targetCoordsReturn;
    });
    component.node.trigger.calcNotificationCoords = jest.fn(() => {
      return notificationCoordsReturn;
    });
    const mascotNodeElement = ReactDOM.findDOMNode(component.node.trigger.target.domNode).getElementsByClassName('mascot')[0];
    const event = new Event('animationend');
    mascotNodeElement.dispatchEvent(event);
    jest.runAllTimers();
    expect(component.html()).toMatchSnapshot();
  });

  test('free mascot wrapper with closeMascot', async () => {
    const component = mount(<Mascot text="free mascot wrapper with closeMascot" timeout={0}/>, {attachTo: container});
    component.node.trigger.getTargetCoords = jest.fn(() => {
      return targetCoordsReturn;
    });
    component.node.trigger.calcNotificationCoords = jest.fn(() => {
      return notificationCoordsReturn;
    });
    component.instance().closeMascot();
    component.node.trigger.target.domNode.dispatchEvent(event);
    expect(component.html()).toMatchSnapshot();
  });
});
