import moment from 'moment-timezone';
import { useState, useEffect } from 'react';
import { useUID } from '@twilio-paste/core/uid-library';
import {
  DataGrid,
  DataGridHead,
  DataGridRow,
  DataGridHeader,
  DataGridBody,
  DataGridCell,
} from '@twilio-paste/core/data-grid';
import { Button } from '@twilio-paste/core/button';
import { TimePicker, formatReturnTime } from '@twilio-paste/core/time-picker';
import { Label } from '@twilio-paste/core/label';
import { Input } from '@twilio-paste/core/input';
import { Stack } from '@twilio-paste/core/stack';
import { TextArea } from '@twilio-paste/core/textarea';
import { Box } from '@twilio-paste/core/box';

const DAYS_OF_WEEK = moment.weekdays();
const TABLE_HEADERS = ['Day', 'Start Time', 'End Time'];

export function WeeklyConfigComponent({ value, addToStagedChanges,isReadOnly }) {
  const [weekConfig, setWeekConfig] = useState(null);
  const [weeklyOfflineMessage, setWeeklyOfflineMessage] = useState('');

  const convertWeeklyTimingsToWeekConfig = ({ weeklyTimings }) => {
    const tempConfig = {};

    DAYS_OF_WEEK.forEach((x) => {
      const existing = weeklyTimings[x];
      tempConfig[x] = existing !=null && existing.begin != null && existing.end != null
          ? { ...existing }
          : {
              begin: '',
              end: '',
            };
    });

    return tempConfig;
  };

  const convertWeekConfigToWeeklyTimings = (weekConfigObj) => {
    if (weekConfigObj == null) {
      return {};
    }

    const tempWeeklyTimings = {};

    DAYS_OF_WEEK.forEach((x) => {
      const existing = weekConfigObj[x];
      tempWeeklyTimings[x] =
        existing != null && existing.begin != '' && existing.end != ''
          ? {
              isActive: true,
              begin: existing.begin,
              end: existing.end,
            }
          : {
              isActive: false,
              begin: null,
              end: null,
            };
    });

    return tempWeeklyTimings;
  };

  useEffect(() => {
    setWeekConfig(convertWeeklyTimingsToWeekConfig(value || { weeklyTimings: {} }));
    setWeeklyOfflineMessage(og=>value?.["offlineMessage"]||og)
  }, [value]);

  useEffect(() => {
    if (addToStagedChanges) {
      addToStagedChanges({
        offlineMessage: weeklyOfflineMessage,
        weeklyTimings: convertWeekConfigToWeeklyTimings(weekConfig),
      });
    }
  }, [weekConfig, weeklyOfflineMessage]);

  const handleTimeChange = (day, fieldName) => {
    return (evt) => {
      const formattedValue = evt.target.value == '' ? '' : formatReturnTime(evt.target.value, 'HH:mm');

      setWeekConfig((orig) => {
        return {
          ...orig,
          [day]: {
            ...orig[day],
            [fieldName]: formattedValue,
          },
        };
      });
    };
  };

  const handleCloneToWeek = (day) => {
    return (evt) => {
      const selectedDayConfig = weekConfig[day];
      const tempConfig = {};
      DAYS_OF_WEEK.forEach((x) => {
        tempConfig[x] = selectedDayConfig;
      });
      setWeekConfig(tempConfig);
    };
  };

  const handleClearDayTimings = (day) => {
    return (evt) => {
      setWeekConfig((og) => {
        return {
          ...og,
          [day]: { begin: '', end: '' },
        };
      });
    };
  };

  const handleChangeWeeklyOfflineMessage = (e) => {
    setWeeklyOfflineMessage(e.target.value);
  };

  if (!weekConfig) {
    return null;
  }

  return (
    <Stack orientation="vertical" spacing="space60">
      <Box>
        <Label>Weekly Timings:</Label>
        <DataGrid striped aria-label="weekly-timing-config">
          <DataGridHead>
            <DataGridRow>
              <DataGridHeader>{TABLE_HEADERS[0]}</DataGridHeader>
              <DataGridHeader>{TABLE_HEADERS[1]}</DataGridHeader>
              <DataGridHeader>{TABLE_HEADERS[2]}</DataGridHeader>
              {
                    !isReadOnly &&
                    <DataGridHeader>Actions</DataGridHeader>
              }
            </DataGridRow>
          </DataGridHead>
          <DataGridBody>
            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <DataGridRow key={`row-${dayIndex}`}>
                <DataGridCell key={`col-day-title`}>{day}</DataGridCell>

                <DataGridCell key={`col-day-begin`}>
                  <TimePicker value={weekConfig[day].begin} onChange={handleTimeChange(day, 'begin')}  readOnly={isReadOnly} />
                </DataGridCell>

                <DataGridCell key={`col-end`}>
                  <TimePicker value={weekConfig[day].end} onChange={handleTimeChange(day, 'end')} readOnly={isReadOnly} />
                </DataGridCell>
                {
                    !isReadOnly &&
                <DataGridCell key={`col-actions`}>
                 
                  
                  <Stack orientation="horizontal" spacing="space60">
                    <Button variant="link" size="small" onClick={handleCloneToWeek(day)}>
                      Clone
                    </Button>

                    <Button variant="destructive_link" size="small" onClick={handleClearDayTimings(day)}>
                      Clear
                    </Button>
                  </Stack>
              
                </DataGridCell>
                }
              </DataGridRow>
            ))}
          </DataGridBody>
        </DataGrid>
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
