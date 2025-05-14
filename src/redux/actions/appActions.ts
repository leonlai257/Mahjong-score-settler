import { SetAppReadyAction, SetAppLoadingAction, AppInitAction } from '@src/types/store/app'
import { SET_APP_READY, SET_APP_LOADING } from '@src/redux/reducers/appReducer'
import { APP_INIT } from '@src/redux/epics/appEpic'

export const setAppReady = (ready: boolean): SetAppReadyAction => ({
    type: SET_APP_READY,
    payload: { ready: ready },
})

export const setAppLoading = (loading: boolean): SetAppLoadingAction => ({
    type: SET_APP_LOADING,
    payload: { loading: loading },
})

export const appInit = (): AppInitAction => ({
    type: APP_INIT.type,
})
