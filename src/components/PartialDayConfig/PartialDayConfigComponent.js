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
import { TimePicker, formatReturnTime } from '@twilio-paste/core/time-picker';
import { Label } from '@twilio-paste/core/label';
import { Input } from '@twilio-paste/core/input';
import { Stack } from '@twilio-paste/core/stack';
import { TextArea } from '@twilio-paste/core/textarea';
import { Box } from '@twilio-paste/core/box';
import { Paragraph } from '@twilio-paste/core/paragraph';
import { AlertDialog } from '@twilio-paste/core/alert-dialog';
import { PlusIcon } from '@twilio-paste/icons/esm/PlusIcon';
import '../../styles/styledTable.css';

export function PartialDayConfigComponent({ value, addToStagedChanges,isReadOnly }) {
  const [partialdayList, setPartialdayList] = useState([]);
  const [confirmDeleteDialogIsOpen, setConfirmDeleteDialogIsOpen] = useState(false);
  const [rowPendingDeletion, setRowPendingDeletion] = useState(null);

  useEffect(() => {}, [rowPendingDeletion, confirmDeleteDialogIsOpen]);

  const convertPartialdayMapToList = (partialdayMap) => {
    const tempPartialdayList = Object.keys(partialdayMap).map((k) => {
      const mapValue = partialdayMap[k];
      return {
        title: mapValue.description,
        date: moment(k, 'MM/DD/yyyy').format('yyyy-MM-DD'),
        offlineMessage: mapValue.offlineMessage,
        key: uuidv4(),
        begin: mapValue.begin,
        end: mapValue.end,
      };
    });

    tempPartialdayList.sort((a, b) => a.date - b.date);
    return tempPartialdayList;
  };

  const convertPartialdayListToMap = (partialdayListObj) => {
    const tempPartialdayMap = {};
    partialdayListObj.forEach((partialday) => {
      tempPartialdayMap[moment(partialday.date, 'yyyy-MM-DD').format('MM/DD/yyyy')] = {
        description: partialday.title,
        offlineMessage: partialday.offlineMessage,
        begin: partialday.begin,
        end: partialday.end,
      };
    });
    return tempPartialdayMap;
  };

  useEffect(() => {
    setPartialdayList(convertPartialdayMapToList(value || {}));
  }, [value]);

  useEffect(() => {
    if (addToStagedChanges) {
      addToStagedChanges(convertPartialdayListToMap(partialdayList));
    }
  }, [partialdayList]);

  const addNewPartialday = () => {
    setPartialdayList((ogList) => {
      return [
        ...ogList,
        { title: '', date: moment().format('yyyy-MM-DD'), offlineMessage: '', key: uuidv4(), begin: '', end: '' },
      ];
    });
  };

  const updatePartialdayConfig = (partialdayKey, partialdayField) => {
    return (e) => {
      setPartialdayList((ogList) => {
        return ogList.map((li) => {
          if (partialdayKey === li.key) {
            return { ...li, [partialdayField]: e.target.value };
          }
          return li;
        });
      });
    };
  };

  const updatePartialdayTime = (partialdayKey, partialdayField) => {
    return (evt) => {
      const formattedValue = evt.target.value === '' ? '' : formatReturnTime(evt.target.value, 'HH:mm');
      setPartialdayList((ogList) => {
        return ogList.map((li) => {
          if (partialdayKey === li.key) {
            return { ...li, [partialdayField]: formattedValue };
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
    setPartialdayList((ogList) => {
      return ogList.filter((item) => item.key !== rowPendingDeletion);
    });
    setRowPendingDeletion(null);
    setConfirmDeleteDialogIsOpen(false);
  };

  return (
    <Stack orientation="vertical" spacing="space60">
      <Stack orientation="horizontal" spacing="space60">
        <Label>Partial Days:</Label>
        {
                    !isReadOnly &&
        <Button variant="secondary" onClick={addNewPartialday}>
          {' '}
          <PlusIcon decorative={false} title="Add New Partial Day" /> Add New
        </Button>
}
      </Stack>

      {partialdayList.length === 0 && <Paragraph>No Partial Days Configured</Paragraph>}

      {partialdayList.length > 0 && (
        <table className="data-grid-clone">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Description</th>
              <th>Offline Message</th>
              {
                    !isReadOnly &&
              <th>Actions</th>
}
            </tr>
          </thead>

          <tbody>
            {partialdayList.map((partialday, partialdayIter) => (
              <tr key={partialday.key}>
                <td>{partialdayIter + 1}</td>
                <td>
                  <DatePicker value={partialday.date} onChange={updatePartialdayConfig(partialday.key, 'date')} readOnly={isReadOnly}  />
                </td>
                <td>
                  <TimePicker value={partialday.begin} onChange={updatePartialdayTime(partialday.key, 'begin')} readOnly={isReadOnly}  />
                </td>

                <td>
                  <TimePicker value={partialday.end} onChange={updatePartialdayTime(partialday.key, 'end')} readOnly={isReadOnly}  />
                </td>

                <td>
                  <Input
                    type="text"
                    value={partialday.title}
                    onChange={updatePartialdayConfig(partialday.key, 'title')}
                    placeholder="Partial Day Name"
                    readOnly={isReadOnly} 
                  />
                </td>
                <td>
                  <TextArea
                    type="text"
                    value={partialday.offlineMessage}
                    onChange={updatePartialdayConfig(partialday.key, 'offlineMessage')}
                    placeholder="Offline Message"
                    readOnly={isReadOnly} 
                  />
                </td>
                {
                    !isReadOnly &&
                <td>
                  <Button variant="destructive_link" size="small" onClick={handleRequestDeletion(partialday.key)}>
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
