import moment from 'moment-timezone';
import { useState, useEffect } from 'react';
import { Combobox } from '@twilio-paste/core/combobox';
import {Text} from '@twilio-paste/core/text'

import {fetchTimezoneList} from '../../helpers'



export function GeneralConfigComponent({ value, addToStagedChanges, isReadOnly }) {

  
  const [timezoneDictionary, setTimezoneDictionary] = React.useState([]);
  const [timezone, setTimezone] = useState(moment.tz.guess());
  const [timezoneFilteredOptions, setTimezoneFilteredOptions] = React.useState([]);
  
  const loadTimezoneDictionary= async ()=>{
    const allTimezones = await fetchTimezoneList();
    setTimezoneDictionary(allTimezones);
    setTimezoneFilteredOptions(allTimezones);
  }
  
  useEffect(() => {
    loadTimezoneDictionary();
  }, []);
 
  useEffect(() => {
    setTimezone((og) => value?.timezone || og);
  }, [value]);

  useEffect(() => {
    if (addToStagedChanges) {
      addToStagedChanges({ timezone });
    }
  }, [timezone]);

  useEffect(() => {
  }, [timezoneDictionary]);

 


  return (
    <Combobox
      autocomplete
      disabled={isReadOnly}
      items={timezoneFilteredOptions}
      labelText="Select a Timezone"
      selectedItem={timezone}
      onSelectedItemChange={(changes) => {
        setTimezone(changes.selectedItem);
      }}
      onInputValueChange={({ inputValue }) => {
        if (inputValue === undefined) {
          setTimezoneFilteredOptions(timezoneDictionary);
          return;
        }

        setTimezoneFilteredOptions(
          timezoneDictionary.filter((item) => {
            return item.toLowerCase().indexOf(inputValue.toLowerCase())>=0;
          }),
        );
      }}
    />
  );
}
