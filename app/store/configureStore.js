import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

export default (history) => {
  const middlewares = [thunk]

  if (process.env.NODE_ENV !== 'production') middlewares.push(createLogger())

  const store = createStore(
    rootReducer,
    applyMiddleware(...middlewares)
  )

  if (module.hot) {
    module.hot.accept('../reducers/index', () => {
      const nextRootReducer = require('../reducers/index').default;
      store.replaceReducer(nextRootReducer);
    })
  }

  return store
}

