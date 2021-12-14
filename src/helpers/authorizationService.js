import { Manager } from '@twilio/flex-ui';

const fetchUserRoles = () => {
    const manager = Manager.getInstance();
    if (manager === null) {
      return [];
    }
  
    try {
      return manager?.store?.getState()?.flex?.session?.ssoTokenPayload?.roles || [];
    } catch (e) {}
    return [];
  };
  
 export const hasAdminRights = () => {
    const userRoles = fetchUserRoles();
    return userRoles.indexOf('admin') >= 0;
  };
  

 