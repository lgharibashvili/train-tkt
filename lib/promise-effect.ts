interface Promise<T> {
  effect(effectFunc: (value: T) => void): Promise<T>;
}

Promise.prototype.effect = function (effectFunc) {
  return this.then((value) => {
    effectFunc(value);
    return value;
  });
};
