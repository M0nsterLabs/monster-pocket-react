import nools from 'nools';
import _ from 'lodash';
import AbstractUseCase from 'UseCase/AbstractUseCase';


export default class FlowAbstraction {
	session;
	result = [];
	_assertions = [];

	static factory(...useCases) {
		const flowName = 'sample';
		const flow = new FlowAbstraction();
		FlowAbstraction._initializeFlow(flow, flowName, FlowAbstraction._convertParametersToList(useCases));

		return flow;
	}


	constructor(session) {
		this._assertions = [];
		if (session) {
			this.setSession(session);
		}
	}

	setSession(session) {
		this.session = session;
	}

	assert(fact) {
		this._assertions.push(fact);
	}

	getFacts() {
		return this.session.getFacts();
	}

	match() {
		this.result = [];
		let session = nools.getFlow('sample').getSession();
		_.forEach(this._assertions, function (assertion) {
			session.assert(assertion);
		});


		(async() => {
			await session.match();
		})();
		session.dispose();

		return this.result;
	}

	static _initializeFlow(flowAbstraction, flowName, useCases) {
		nools.deleteFlow(flowName);
		if (nools.hasFlow(flowName)) {
			return;
		}

		nools.flow(flowName, function (flow) {
			_.forEach(useCases, (useCase) => {
				const ucase = _.isFunction(useCase) ? new useCase : useCase;
				flow.rule.call(flow, ucase.name(), ucase.conditions(), (function (ucase) {
					return function () {
						this.result.push(ucase.action());
					}.bind(flowAbstraction);
				})(ucase));
			});
		});
	}

	static _convertParametersToList(useCases) {
		if (useCases.length === 1 && !_.isFunction(useCases[0]) && !useCases[0] instanceof AbstractUseCase) {
			useCases = _.values(useCases [0]);
		}
		return useCases;
	}
}
