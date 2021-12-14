import { View } from '@twilio/flex-ui';

import { DowntimeManagerLink, DowntimeManagerView } from '../components';
import { hasAdminRights } from '../helpers';

const { REACT_APP_DOWNTIME_MANAGER_VIEW_NAME } = process.env;

export const initializeDowntimeManager = (flex, manager) => {
  flex.ViewCollection.Content.add(
    <View name={REACT_APP_DOWNTIME_MANAGER_VIEW_NAME} key="downtime-manager-view">
      <DowntimeManagerView key="downtime-manager-viewcontent" />
    </View>,
    {
      if: hasAdminRights,
    },
  );

  flex.SideNav.Content.add(<DowntimeManagerLink key="downtime-manager-link" flex={flex} />, {
    if: hasAdminRights,
    sortOrder: 5,
  });
};
