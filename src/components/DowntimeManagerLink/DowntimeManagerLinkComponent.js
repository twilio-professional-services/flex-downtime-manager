import { SideLink } from '@twilio/flex-ui';

const { REACT_APP_DOWNTIME_MANAGER_VIEW_NAME } = process.env;

export function DowntimeManagerLinkComponent(props) {
  const gotoDowntimeManager = () => {
    props.flex.Actions.invokeAction('NavigateToView', { viewName: REACT_APP_DOWNTIME_MANAGER_VIEW_NAME });
  };

  return (
    <SideLink
      {...props}
      icon="Clock"
      iconActive="Clock"
      isActive={props.activeView === REACT_APP_DOWNTIME_MANAGER_VIEW_NAME}
      showLabel={props.showLabel}
      onClick={gotoDowntimeManager}
      key="downtime-manager-sidelink-item"
    >
      Downtime Manager
    </SideLink>
  );
}
