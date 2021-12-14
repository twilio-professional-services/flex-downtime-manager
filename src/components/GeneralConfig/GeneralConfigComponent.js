import moment from 'moment-timezone';
import { useState, useEffect } from 'react';
import { Combobox } from '@twilio-paste/core/combobox';
import {Text} from '@twilio-paste/core/text'
const TIMEZONE_LIST = moment.tz.names();
export function GeneralConfigComponent({ value, addToStagedChanges, isReadOnly }) {
  const [timezone, setTimezone] = useState(moment.tz.guess());
  const [timezoneOptions, setTimezoneOptions] = React.useState(TIMEZONE_LIST);
  useEffect(() => {
    setTimezone((og) => value?.timezone || og);
  }, [value]);

  useEffect(() => {
    if (addToStagedChanges) {
      addToStagedChanges({ timezone });
    }
  }, [timezone]);

  const handleChangeTimezone = (e) => {
    setTimezone(e.target.value);
  };


 


  return (
    <Combobox
      autocomplete
      disabled={isReadOnly}
      items={timezoneOptions}
      labelText="Select a Timezone"
      selectedItem={timezone}
      onSelectedItemChange={(changes) => {
        setTimezone(changes.selectedItem);
      }}
      onInputValueChange={({ inputValue }) => {
        if (inputValue === undefined) {
          setTimezoneOptions(TIMEZONE_LIST);
          return;
        }

        setTimezoneOptions(
          TIMEZONE_LIST.filter((item) => {
            return item.toLowerCase().startsWith(inputValue.toLowerCase());
          }),
        );
      }}
    />
  );
}
