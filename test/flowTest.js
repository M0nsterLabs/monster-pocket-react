import Flow from 'model/advice/Flow';
import A1 from 'model/advice/UseCase/A1';
import {expect} from 'chai';

describe('flow', function () {
  beforeEach(function () {
    this.flow = new Flow();
  });

  it('can be created', function () {
    this.flow.addUseCase(new A1());
    expect(this.flow.getUseCases().length).to.equal(1);

    this.flow.addUseCase(new A1());
    expect(this.flow.getUseCases().length).to.equal(2);
  });
});
