/* global describe: false, it: false, expect: false, toMatchSnapshot: false, beforeEach: false, afterEach: false, jest: false */
import React from 'react';
import ReactDOM from 'react-dom';
import {
  mount,
  shallow,
  render
} from 'enzyme';
import SocialProof from '../../../src/components/social_proof/SocialProof.jsx'


let container;
let animationend;
beforeEach(() => {
  jest.useFakeTimers();
  jest.mock('shortid');
  container = document.createElement('div');
  animationend = new Event('animationend');
});

describe('SocialProofs:', () => {
  test('Only text params', () => {
    let component = mount(<SocialProof notice={[{text : 'Only text params'}]}/>);
    expect(component.html()).toMatchSnapshot();
  });

  test('Notice with icon & text params', () => {
    let component = mount(<SocialProof notice={[{
      text : 'Notice with icon & text params',
      icon : 'head'
    }]}/>);
    expect(component.html()).toMatchSnapshot();
  });

  test('Only text params & className', () => {
    let component = mount(<SocialProof notice={[{
      text      : 'Only text params & className',
      className : 'test'
    }]}/>);
    expect(component.html()).toMatchSnapshot();
  });

  test('Only text params & re-render component with object', () => {
    let component = mount(<SocialProof notice={[{
      text      : 'Only text params',
      className : 'test'
    }]}/>);
    component.setProps({
      notice : {
        text      : 're-render component with object',
        className : 'test'
      }
    });
    expect(component.html()).toMatchSnapshot();
  });

  test('Only text params & re-render component with array', () => {
    let component = mount(<SocialProof notice={[{
      text      : 'Only text params',
      className : 'test'
    }]}/>);
    component.setProps({
      notice : [{
        text      : 're-render component with array',
        className : 'test'
      }]
    });
    expect(component.html()).toMatchSnapshot();
  });

  test('Open notice & click the close', () => {
    let component = mount(<SocialProof notice={
      {
        text      : 'Only text params',
        className : 'test'
      }
    }/>);
    component.find('.notice__closeBlock__closeArea').simulate('click');
    jest.runAllTimers();
    component.find('.notice_hide').node.dispatchEvent(animationend);
    expect(component.find('.notice').exists()).toBe(false);
  });

  test('Open notices & click the close of one', () => {
    let component = mount(<SocialProof notice={[
      {
        text      : 'Only text params',
        className : 'test'
      },
      {
        text      : 'Only text params copy',
        className : 'test'
      }
    ]}/>);
    component.find('.notice__closeBlock__closeArea').last().simulate('click');
    jest.runAllTimers();
    component.find('.notice_hide').node.dispatchEvent(animationend);
    expect(component.html()).toMatchSnapshot();
  });

});