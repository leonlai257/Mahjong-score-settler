import { createSlice } from '@reduxjs/toolkit'
import { InitialState } from '@src/types/store/app'
import { SetAppReadyAction, SetAppLoadingAction } from '@src/types/store/app'

export const initialState: InitialState = {
    ready: false,
    loading: false,
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setReady(state, action: SetAppReadyAction) {
            state.ready = action.payload.ready
        },
        setLoading(state, action: SetAppLoadingAction) {
            state.loading = action.payload.loading
        },
    },
})

export const SET_APP_READY: string = appSlice.actions.setReady.type
export const SET_APP_LOADING: string = appSlice.actions.setLoading.type

export default appSlice.reducer
