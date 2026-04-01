// Script to expose Zustand store on window for testing
(function() {
  // Try to find the store via React internals
  function findStore() {
    var root = document.getElementById('root');
    if (!root) return null;
    
    var keys = Object.keys(root).filter(function(k) { 
      return k.startsWith('__reactFiber') || k.startsWith('_reactRoot') || k.startsWith('__reactContainer'); 
    });
    
    for (var ki = 0; ki < keys.length; ki++) {
      try {
        var fiber = root[keys[ki]];
        if (!fiber) continue;
        
        // Walk the fiber tree
        var current = fiber;
        for (var i = 0; i < 200 && current; i++) {
          if (current.stateNode && current.stateNode.store && typeof current.stateNode.store.getState === 'function') {
            return current.stateNode.store;
          }
          if (current.stateNode && current.stateNode.__store__ && typeof current.stateNode.__store__.getState === 'function') {
            return current.stateNode.__store__;
          }
          // Try memoizedProps
          if (current.memoizedProps && current.memoizedProps.store && typeof current.memoizedProps.store.getState === 'function') {
            return current.memoizedProps.store;
          }
          current = current.return || current.child || current.sibling;
        }
      } catch(e) {}
    }
    return null;
  }
  
  var store = findStore();
  if (store) {
    window.__testStore = store;
    console.log('[TEST] Store exposed:', store.getState().modules.length, 'modules');
  } else {
    console.log('[TEST] Store not found');
  }
})();
