export function compose(...fns: Function[]) {
  return function (el) {
    let f = fns.shift();
    return fns.reduce((p, c) => {
      return p && c(el);
    }, f(el));
  };
};
