import { Manager } from '@twilio/flex-ui';
import { SyncClient } from 'twilio-sync';

const SYNC_CLIENT = new SyncClient(Manager.getInstance().user.token);

export const readDocumentData = async (uniqueName) => {
  return SYNC_CLIENT.document(uniqueName)
    .then((d) =>{ return d.data})
    .catch((e) => {console.error(e);return null});
};
