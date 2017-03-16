import { combineReducers } from 'redux'
import todo from './todo'
import count from './count'
import alertMessage from './alertMessage';

export default combineReducers({
  todo,
  count,
  alertMessage,
})
