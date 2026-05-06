import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const loginUser = (userName: string, password: string) =>
    dispatch(login({ userName, password }));
  const logoutUser = () => dispatch(logout());

  return { ...auth, loginUser, logoutUser };
}