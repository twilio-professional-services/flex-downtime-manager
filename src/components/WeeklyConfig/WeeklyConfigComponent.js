import moment from 'moment-timezone';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@twilio-paste/core/button';
import { TimePicker, formatReturnTime } from '@twilio-paste/core/time-picker';
import { Label } from '@twilio-paste/core/label';
import { Input } from '@twilio-paste/core/input';
import { Combobox } from '@twilio-paste/core/combobox';
import { Stack } from '@twilio-paste/core/stack';
import { TextArea } from '@twilio-paste/core/textarea';
import { PlusIcon } from '@twilio-paste/icons/esm/PlusIcon';
import { Box } from '@twilio-paste/core/box';

import '../../styles/styledTable.css';
const DAYS_OF_WEEK = moment.weekdays();


export function WeeklyConfigComponent({ value, addToStagedChanges,isReadOnly }) {

  const [hoopRows, setHoopRows] = useState([]);
  const [weeklyOfflineMessage, setWeeklyOfflineMessage] = useState('');

  const convertWeeklyTimingsToHoopList = (configObj)=>{

    if(configObj==null || configObj.weeklyTimings == null){
      return [];
    }

    const tempHoopRows = [];
   
    DAYS_OF_WEEK.forEach((x) => {
      let existing = configObj.weeklyTimings[x];
      if(existing!=null){
        if(!Array.isArray(existing)){
          existing = [existing];
        }

        existing.forEach(row=>{
          tempHoopRows.push({ dayOfWeek:x, begin:row.begin,end:row.end, key: uuidv4() })
        })



      }
    });

    tempHoopRows.sort((a, b) => {
      if(a.dayOfWeek==b.dayOfWeek){
        var beginningTimeA = moment(a.begin, 'kk:mm');
        var beginningTimeB = moment(b.begin, 'kk:mm');
        return beginningTimeA.toDate() - beginningTimeB.toDate()
      }
      return DAYS_OF_WEEK.indexOf(a.dayOfWeek)-DAYS_OF_WEEK.indexOf(b.dayOfWeek)
    }
    );

    return tempHoopRows;


  }


  const convertHoopListToWeeklyTimings = (rows)=>{
    const tempWeeklyTimings = {};
    DAYS_OF_WEEK.forEach((d) => {
      tempWeeklyTimings[d] = rows.filter(x=>x.dayOfWeek===d && x.begin!=null && x.end!=null)
                                 .map(x=>{return {'begin':x.begin,'end':x.end}});
    })
    return tempWeeklyTimings;
  }

  useEffect(() => {
    setHoopRows(convertWeeklyTimingsToHoopList(value));
    setWeeklyOfflineMessage(og=>value?.["offlineMessage"]||og);
  }, [value]);


  useEffect(() => {
    if (addToStagedChanges) {
      addToStagedChanges({
        offlineMessage: weeklyOfflineMessage,
        weeklyTimings: convertHoopListToWeeklyTimings(hoopRows)
      }
        );
    }
  }, [hoopRows]);

  

  const handleChangeWeeklyOfflineMessage = (e) => {
    setWeeklyOfflineMessage(e.target.value);
  };


  const handleAddNewHoopRow = () => {
    setHoopRows((ogList) => {
      return [...ogList, { dayOfWeek: 'Monday', begin:'',end:'', key: uuidv4() }];
    });
  };

  const handleDeleteHoopRow = (key) => {
    return ()=>{
      setHoopRows((ogList) => {
        return ogList.filter(row=>row.key!=key);
      });
  }
  };

  const handleUpdateHoopRowDayOfWeek = (key) => {
    return (e)=>{
      setHoopRows((ogList) => {
        return ogList.map((li) => {
          if (key === li.key) {
            return { ...li, dayOfWeek: e.selectedItem };
          }
          return li;
        });
      });
  }
  };

  const handleUpdateHoopRowTime = (key, fieldName) => {
    return (evt) => {
      const formattedValue = evt.target.value == '' ? '' : formatReturnTime(evt.target.value, 'HH:mm');

      setHoopRows((ogList) => {
        return ogList.map((li) => {
          if (key === li.key) {
            return { ...li, [fieldName]: formattedValue };
          }
          return li;
        });
      });
    };
  };


  return (
    <Stack orientation="vertical" spacing="space60">
      <Box>
      <Stack orientation="horizontal" spacing="space60" >
        <Label>Hours of Operation:</Label>
        {
                    !isReadOnly &&
        <Button variant="secondary" onClick={handleAddNewHoopRow}>
          {' '}
          <PlusIcon decorative={false} title="Add Row" /> Add Row
        </Button>
}

      </Stack>
      <br />

        <table className="data-grid-clone">
          <thead>
            <tr>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
              {
                    !isReadOnly &&
              <th>Actions</th>
}
              </tr>
              </thead>
              <tbody>
                {
                  hoopRows.map(hoopRow=>(
                    <tr key={`hoop-edit-row-${hoopRow.key}`}>
                          <td className="hide-child-combo-label">
                          <Combobox
    labelText={""}
      items={DAYS_OF_WEEK}
      selectedItem={hoopRow.dayOfWeek}
      onSelectedItemChange={handleUpdateHoopRowDayOfWeek(hoopRow.key)}
      disabled={isReadOnly}
    />
                          </td>
                          <td>
                          <TimePicker value={hoopRow.begin} onChange={handleUpdateHoopRowTime(hoopRow.key,'begin')} readOnly={isReadOnly}  />
                          </td>
                          <td>
                          <TimePicker value={hoopRow.end} onChange={handleUpdateHoopRowTime(hoopRow.key,'end')} readOnly={isReadOnly} />
                          </td>
                          {
                    !isReadOnly &&
                          <td>

                          <Button variant="destructive_link" size="small" onClick={handleDeleteHoopRow(hoopRow.key)} >
                    Delete
                  </Button>
                          </td>
}
                      </tr>
                  ))
                }
              </tbody>
            </table>

    
      </Box>

      <Box>
        <Label>Offline Message:</Label>
        <TextArea
          type="text"
          placeholder="Offline Message"
          value={weeklyOfflineMessage}
          onChange={handleChangeWeeklyOfflineMessage}
          readOnly={isReadOnly} 
        />
      </Box>
    </Stack>
  );
}
