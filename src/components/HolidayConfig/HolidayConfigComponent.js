import moment from 'moment-timezone';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  DataGrid,
  DataGridHead,
  DataGridRow,
  DataGridHeader,
  DataGridBody,
  DataGridCell,
} from '@twilio-paste/core/data-grid';
import { Button } from '@twilio-paste/core/button';
import { DatePicker, formatReturnDate } from '@twilio-paste/core/date-picker';
import { Label } from '@twilio-paste/core/label';
import { Input } from '@twilio-paste/core/input';
import { Stack } from '@twilio-paste/core/stack';
import { TextArea } from '@twilio-paste/core/textarea';
import { Box } from '@twilio-paste/core/box';
import { Paragraph } from '@twilio-paste/core/paragraph';
import { AlertDialog } from '@twilio-paste/core/alert-dialog';
import { PlusIcon } from '@twilio-paste/icons/esm/PlusIcon';
import '../../styles/styledTable.css';

export function HolidayConfigComponent({ value, addToStagedChanges,isReadOnly }) {
  const [holidayList, setHolidayList] = useState([]);
  const [confirmDeleteDialogIsOpen, setConfirmDeleteDialogIsOpen] = useState(false);
  const [rowPendingDeletion, setRowPendingDeletion] = useState(null);

  useEffect(() => {}, [rowPendingDeletion, confirmDeleteDialogIsOpen]);

  const convertHolidayMapToList = (holidayMap) => {
    const tempHolidayList = Object.keys(holidayMap).map((k) => {
      const mapValue = holidayMap[k];
      return {
        title: mapValue.description,
        date: moment(k, 'MM/DD/yyyy').format('yyyy-MM-DD'),
        offlineMessage: mapValue.offlineMessage,
        key: uuidv4(),
      };
    });

    tempHolidayList.sort((a, b) => a.date - b.date);
    return tempHolidayList;
  };

  const convertHolidayListToMap = (holidayListObj) => {
    const tempHolidayMap = {};
    holidayListObj.forEach((holiday) => {
      tempHolidayMap[moment(holiday.date, 'yyyy-MM-DD').format('MM/DD/yyyy')] = {
        description: holiday.title,
        offlineMessage: holiday.offlineMessage,
      };
    });
    return tempHolidayMap;
  };

  useEffect(() => {
    setHolidayList(convertHolidayMapToList(value || {}));
  }, [value]);

  useEffect(() => {
    if (addToStagedChanges) {
      addToStagedChanges(convertHolidayListToMap(holidayList));
    }
  }, [holidayList]);

  const addNewHoliday = () => {
    setHolidayList((ogList) => {
      return [...ogList, { title: '', date: moment().format('yyyy-MM-DD'), offlineMessage: '', key: uuidv4() }];
    });
  };

  const updateHolidayConfig = (holidayKey, holidayField) => {
    return (e) => {
      setHolidayList((ogList) => {
        return ogList.map((li) => {
          if (holidayKey === li.key) {
            return { ...li, [holidayField]: e.target.value };
          }
          return li;
        });
      });
    };
  };

  const handleRequestDeletion = (key) => {
    return () => {
      setRowPendingDeletion(key);
      setConfirmDeleteDialogIsOpen(true);
    };
  };
  const handleCancelDeletion = () => {
    setRowPendingDeletion(null);
    setConfirmDeleteDialogIsOpen(false);
  };

  const handleConfirmDeletion = () => {
    setHolidayList((ogList) => {
      return ogList.filter((item) => item.key !== rowPendingDeletion);
    });
    setRowPendingDeletion(null);
    setConfirmDeleteDialogIsOpen(false);
  };

  return (
    <Stack orientation="vertical" spacing="space60">
      <Stack orientation="horizontal" spacing="space60">
        <Label>Holidays:</Label>

        {
                    !isReadOnly &&
        <Button variant="secondary" onClick={addNewHoliday}>
          {' '}
          <PlusIcon decorative={false} title="Add New Holiday" /> Add New
        </Button>
}
      </Stack>

      {holidayList.length === 0 && <Paragraph>No Holidays Configured</Paragraph>}

      {holidayList.length > 0 && (
        <table className="data-grid-clone">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Date</th>
              <th>Description</th>
              <th>Offline Message</th>
              {
                    !isReadOnly &&
              <th>Actions</th>
}
            </tr>
          </thead>

          <tbody>
            {holidayList.map((holiday, holidayIter) => (
              <tr key={holiday.key}>
                <td>{holidayIter + 1}</td>
                <td>
                  <DatePicker value={holiday.date} onChange={updateHolidayConfig(holiday.key, 'date')} readOnly={isReadOnly} />
                </td>
                <td>
                  <Input
                    type="text"
                    value={holiday.title}
                    onChange={updateHolidayConfig(holiday.key, 'title')}
                    placeholder="Holiday Name"
                    readOnly={isReadOnly} 
                  />
                </td>
                <td>
                  <TextArea
                    type="text"
                    value={holiday.offlineMessage}
                    onChange={updateHolidayConfig(holiday.key, 'offlineMessage')}
                    placeholder="Offline Message"
                    readOnly={isReadOnly} 
                  />
                </td>
                {
                    !isReadOnly &&
                <td>
                  <Button variant="destructive_link" size="small" onClick={handleRequestDeletion(holiday.key)}>
                    Delete
                  </Button>
                </td>
}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AlertDialog
        heading="Delete Row"
        isOpen={confirmDeleteDialogIsOpen}
        destructive
        onConfirm={handleConfirmDeletion}
        onConfirmLabel="Delete"
        onDismiss={handleCancelDeletion}
        onDismissLabel="Cancel"
      >
        Are you sure you want to delete this row? This action cannot be undone.
      </AlertDialog>
    </Stack>
  );
}
