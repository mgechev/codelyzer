// Lewenshtein algorithm
export const stringDistance = (s: string, t: string, ls: number = s.length, lt: number = t.length) => {
  let memo = [];
  let currRowMemo;
  let i;
  let k;
  for (k = 0; k <= lt; k += 1) {
    memo[k] = k;
  }
  for (i = 1; i <= ls; i += 1) {
    currRowMemo = [i];
    for (k = 1; k <= lt; k += 1) {
      currRowMemo[k] = Math.min(
        currRowMemo[k - 1] + 1,
        memo[k] + 1,
        memo[k - 1] + (s[i - 1] !== t[k - 1] ? 1 : 0)
      );
    }
    memo = currRowMemo;
  }
  return memo[lt];
};
