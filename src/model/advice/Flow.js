import nools from 'nools';
import _ from 'lodash';

export default class Flow {
  constructor (name) {
    this.name = name;
    this.useCases = [];
    this.facts = [];
  }

  assert (fact) {
    this.facts.push(fact);
    return this;
  }

  retract (fact) {
    _.remove(this.facts, (element) => {
      return (element instanceof fact);
    });
  }

  swap (Fact, fn) {
    let facts = _.filter(this.facts, (element) => {
      return (element instanceof Fact);
    });

    if (facts.length === 0) {
      const newFact = new Fact();
      facts = [newFact];
      this.facts.push(newFact);
    }

    _.forEach(facts, fn);
  }

  replace (fact) {
    this.retract(fact.constructor);
    this.assert(fact);
  }

  getFacts () {
    const session = this._createSession();
    return session.getFacts();
  }

  match (facts) {
    let session = this._createSession();

    (async () => {
      await session.match();
    })();
    session.dispose();

    return this.result;
  }

  _createSession () {
    this.result = [];
    nools.deleteFlow(this.name);
    if (nools.hasFlow(this.name)) {
      return;
    }

    nools.flow(this.name, function (flow) {
      _.forEach(this.useCases, (UseCase) => {
        const ucase = _.isFunction(UseCase) ? new UseCase() : UseCase;
        const flowRule = flow.rule;
        flowRule.call(flow, ucase.name(), ucase.conditions(), function (ucase) {
          return function (facts, b) {
            var result = ucase.action(facts);
            if (_.isUndefined(result)) {
              result = {};
            }
            this.result.push(_.assignIn({useCase: ucase.name()}, result));
          }.bind(this);
        }.bind(this)(ucase));
      });
    }.bind(this));

    let session = nools.getFlow(this.name).getSession();
    this._assertFacts(session);

    return session;
  }

  _assertFacts (session) {
    _.forEach(this.facts, function (fact) {
      session.assert(fact);
    });
    return session;
  }

  addUseCase (useCase) {
    this.useCases.push(useCase);
  }

  getUseCases () {
    return this.useCases;
  }
}
