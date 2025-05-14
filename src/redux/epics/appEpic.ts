import { Action } from '@reduxjs/toolkit'
import { StateObservable, combineEpics, ofType, Epic } from 'redux-observable'
import { Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { RootState } from '@src/redux/store'
import { setAppReady } from '@src/redux/actions/appActions'
import { createAction } from '@reduxjs/toolkit'

export const APP_INIT = createAction<any>('APP_INIT')
export const CHANGE_LANG = createAction<any>('CHANGE_LANG')

const appInitEpic: Epic<Action, Action, RootState> = (action$: Observable<Action>, state$: StateObservable<RootState>) => {
    return action$.pipe(
        ofType(APP_INIT),
        switchMap(() => {
            return of(setAppReady(true))
        })
    )
}

export default combineEpics(appInitEpic)
