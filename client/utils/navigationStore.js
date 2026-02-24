/**
 * navigationStore.js
 * A tiny in-memory store for passing data between screens during back navigation.
 * No AsyncStorage = no async race. No router.navigate = no wrong route.
 * Just a plain JS object — lives as long as the JS bundle is in memory.
 */

const store = {
  returnTab: null,
};

export const setReturnTab = (tab) => { store.returnTab = tab; };
export const consumeReturnTab = () => {
  const tab = store.returnTab;
  store.returnTab = null; // consume so it doesn't re-apply
  return tab;
};
