export default class AbstractUseCase {
  name () {
    return this.id;
  }

  conditions () {
    throw new Error('abstract');
  }

  action () {
    throw new Error('abstract');
  }

  _rand (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
