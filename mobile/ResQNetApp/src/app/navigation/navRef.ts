import { createNavigationContainerRef } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();
export const goToSOS = () => navigationRef.isReady() && navigationRef.navigate('SOS' as never);