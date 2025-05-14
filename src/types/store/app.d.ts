import { SET_APP_READY, SET_APP_LOADING } from '@src/redux/reducers/appReducer'
import { APP_INIT } from '@src/redux/epics/appEpic'
export interface InitialState {
    ready: boolean
    loading: boolean
}

export interface SetAppReadyAction {
    type: typeof SET_APP_READY
    payload: { ready: boolean }
}

export interface SetAppLoadingAction {
    type: typeof SET_APP_LOADING
    payload: { loading: boolean }
}

export interface AppInitAction {
    type: typeof APP_INIT.type
}
