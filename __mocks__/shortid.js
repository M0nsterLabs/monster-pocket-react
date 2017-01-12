'use strict';

const shortid = jest.genMockFromModule('shortid');


let IDs = [
  {
    id   : 'qwerty1',
    used : false
  },
  {
    id   : 'qwerty2',
    used : false
  },
  {
    id   : 'qwerty3',
    used : false
  },
  {
    id   : 'qwerty4',
    used : false
  },
  {
    id   : 'qwerty5',
    used : false
  },
  {
    id   : 'qwerty6',
    used : false
  },
  {
    id   : 'qwerty7',
    used : false
  },
  {
    id   : 'qwerty8',
    used : false
  },
  {
    id   : 'qwerty9',
    used : false
  },
  {
    id   : 'qwerty10',
    used : false
  },
  {
    id   : 'qwerty11',
    used : false
  },
  {
    id   : 'qwerty12',
    used : false
  },
  {
    id   : 'qwerty13',
    used : false
  },
  {
    id   : 'qwerty14',
    used : false
  }
];

function generate() {
  const id = IDs.find((element, index)=>{
    let result = false;
    if(!element.used){
      IDs[index].used = true;
      result = element
    }
    return result;
  });
  return id.id;
}



shortid.generate = generate;

module.exports = shortid;