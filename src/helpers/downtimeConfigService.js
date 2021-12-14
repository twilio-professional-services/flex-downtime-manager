import { Manager  } from '@twilio/flex-ui';
import { request } from './request';

 export const createDowntimeConfigMutex = async ()=>{
 const manager = Manager.getInstance();

   return  request('create-downtime-config-mutex',manager,{})

}

export const releaseDowntimeConfigMutex = async ()=>{
  const manager = Manager.getInstance();
 
    return  request('release-downtime-config-mutex',manager,{})
 
 }

 export const updateDowntimeConfig = async (downtimeConfig)=>{
  const manager = Manager.getInstance();
 
    return  request('update-downtime-config',manager,{downtimeConfig:JSON.stringify(downtimeConfig)})
 
 }
 export const hasCreatedDowntimeConfigMutex = async ()=>{
  const manager = Manager.getInstance();
 
    return  request('check-downtime-config-mutex',manager,{})
 
 }
 
 