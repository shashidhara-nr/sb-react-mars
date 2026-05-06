import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@store/index';

/**
 * Typed hooks for RTK v2 + React-Redux v9 + Redux v5
 * Works with redux-persist without losing type information
 */
export const useAppDispatch = () => useReduxDispatch<AppDispatch>();
export const useAppSelector = <TSelected,>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (a: TSelected, b: TSelected) => boolean
) => useReduxSelector<RootState, TSelected>(selector, equalityFn);
