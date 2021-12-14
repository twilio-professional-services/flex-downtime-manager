import moment from 'moment-timezone';
import { useState, useEffect } from 'react';
import { Radio, RadioGroup } from '@twilio-paste/core/radio-group';
import { Stack } from '@twilio-paste/core/stack';
import { TextArea } from '@twilio-paste/core/textarea';
import { Box } from '@twilio-paste/core/box';
import { Label } from '@twilio-paste/core/label';

export function EmergencyConfigComponent({ value, addToStagedChanges,isReadOnly }) {
  const [unplannedShutdownFlag, setUnplannedShutdownFlag] = useState(false);
  const [unplannedShutdownMessage, setUnplannedShutdownMessage] = useState('');

  useEffect(() => {
    setUnplannedShutdownFlag((og) => value?.emergencyShutdown || og);
    setUnplannedShutdownMessage((og) => value?.emergencyShutdownMessage || og);
  }, [value]);

  useEffect(() => {
    if (addToStagedChanges) {
      addToStagedChanges({
        emergencyShutdown: unplannedShutdownFlag,
        emergencyShutdownMessage: unplannedShutdownMessage,
      });
    }
  }, [unplannedShutdownFlag, unplannedShutdownMessage]);

  useEffect(() => {
    if (unplannedShutdownFlag === false) {
      setUnplannedShutdownMessage('');
    }
  }, [unplannedShutdownFlag]);

  const handleUnplannedShutdownFlagChange = (e) => {
    setUnplannedShutdownFlag((orig) => !orig);
  };

  const handleUnplannedShutdownMessageChange = (e) => {
    setUnplannedShutdownMessage(e.target.value);
  };

  return (
    <Stack orientation="vertical" spacing="space60">
      <Box>
        <RadioGroup
          value={`${unplannedShutdownFlag}`}
          legend="Emergency Downtime:"
          helpText="This will setup an automatic response for all incoming communications"
          name="emergency-switch"
          onChange={handleUnplannedShutdownFlagChange}
          disabled={isReadOnly}
        >
          <Radio name="emergency-switch" id={'true'} value={'true'}>
            Enabled
          </Radio>
          <Radio name="emergency-switch" id={'false'} value={'false'}>
            Disabled
          </Radio>
        </RadioGroup>
      </Box>

      {unplannedShutdownFlag === true && (
        <Box>
          <Label>Offline Message:</Label>
          <TextArea
            type="text"
            placeholder="Offline Message"
            value={unplannedShutdownMessage}
            onChange={handleUnplannedShutdownMessageChange}
            readOnly={isReadOnly}
          />
        </Box>
      )}
    </Stack>
  );
}
