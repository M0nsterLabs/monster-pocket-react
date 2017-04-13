/* global jest: false */
'use strict';
let shortid = jest.genMockFromModule('shortid');
const keyWord = 'qwerty';
let id = 0;

function generate () {
  const result = `${keyWord}${id}`;
  id++;
  return result;
}

module.exports = {...shortid, ...{generate}};
