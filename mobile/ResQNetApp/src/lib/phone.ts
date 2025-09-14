import { getAuth } from '@react-native-firebase/auth';

export const idFromPhone = (e164?: string | null) =>
  e164 ? e164.replace(/^\+/, '') : '';

export const getCurrentPhone = () => getAuth().currentUser?.phoneNumber ?? null;