import { Theme } from '@twilio-paste/core/theme';
import { Flex } from '@twilio-paste/core/flex';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@twilio-paste/core/tabs';
import { Heading } from '@twilio-paste/core/heading';
import { Box } from '@twilio-paste/core/box';
import { Button } from '@twilio-paste/core/button';
import {Alert} from '@twilio-paste/core/alert';
import { GeneralConfig, WeeklyConfig, EmergencyConfig, HolidayConfig, PartialDayConfig } from '..';
import { readDocumentData} from '../../services';
import {Spinner} from '@twilio-paste/core/spinner';
import { createDowntimeConfigMutex,releaseDowntimeConfigMutex,updateDowntimeConfig,hasCreatedDowntimeConfigMutex } from '../../helpers';
import {Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading} from '@twilio-paste/core/modal';
import {Text} from '@twilio-paste/core/text'
import { Stack } from '@twilio-paste/core/stack';
import './index.css';
import { useState, useEffect } from 'react';

export function DowntimeManagerViewComponent(props) {
  const { REACT_APP_TEAM_SCHEDULE_SYNC_UNIQUE_NAME: syncDocUniqueName, REACT_APP_TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME: mutexUniqueName } = process.env;


  const [isReadOnly,setIsReadOnly] = useState(true);

  const [teamScheduleConfig, setTeamScheduleConfig] = useState({});
  const [unpublishedContent, setUnpublishedContent] = useState({});

  const [showInProgress,setShowInProgress] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage,setShowErrorMessage] = useState(false);
  const [displayMessage,setDisplayMessage] = useState(false);

  const loadExisitingData = async () => {
    setShowInProgress(true);
    const exisitingData = await readDocumentData(syncDocUniqueName);
    setTeamScheduleConfig(exisitingData || {});
    const hasCreatedMutex = await hasCreatedDowntimeConfigMutex();
    console.error(hasCreatedMutex,"--hasCreatedMutex");
    if("200"===hasCreatedMutex.statusCode && true == hasCreatedMutex.hasExistingMutex){
      setIsReadOnly(false);
    }

    setShowInProgress(false);
  };

  


  useEffect(() => {
  
    loadExisitingData();
  }, []);

  useEffect(()=>{

        
  
    
   
},[teamScheduleConfig])

  const handleAddToUnpublishedChanges = (groupName) => {
    return (v) => {
      setUnpublishedContent((d) => {
        return { ...d, [groupName]: v };
      });
    };
  };

  const clearAlerts = ()=>{
     setShowSuccessMessage(false);
     setShowErrorMessage(false);
     setDisplayMessage("");
  }

  const handleBeginEdit = async()=>{
    setShowInProgress(true);
    let lockStatus = await createDowntimeConfigMutex();
    if("200"===lockStatus.statusCode){
      await loadExisitingData();
      setIsReadOnly(false);
    }
    else{
      setShowErrorMessage(true);
      setDisplayMessage("Sorry, someone else is updating the configuration right now");
    }
    setShowInProgress(false);

  
    
  }

  const handlePublishChanges = async()=>{
    setShowInProgress(true);
    const mergedData = {
      ...teamScheduleConfig,
      ...unpublishedContent,
    };
    const updateResponse = await updateDowntimeConfig(mergedData);
    if("200"===updateResponse.statusCode){
       setShowSuccessMessage(true);
       setDisplayMessage("The configuration was updated successfully!");
      setUnpublishedContent({});
    }
    else{
      setShowErrorMessage(true);
      setDisplayMessage("Sorry, there was a problem updating the configuration");
    }
   
    await loadExisitingData();
    setShowInProgress(false);
    setIsReadOnly(true);
  }

  const handleCancelChanges = async()=>{
    setShowInProgress(true);
    await releaseDowntimeConfigMutex();
    await loadExisitingData();
    setUnpublishedContent({});
    setIsReadOnly(true);
    setShowInProgress(false);
  }


  return (
    <Theme.Provider theme="flex">
      
      {showSuccessMessage &&
        <Alert onDismiss={clearAlerts} variant="neutral">
        <Text as="span">
          {displayMessage}
        </Text>
      </Alert>
      }
      {
        showErrorMessage &&
        <Alert onDismiss={clearAlerts} variant="error">
        <Text as="span">
        {displayMessage}
        </Text>
      </Alert>
      }
     
         
      


      <Box as="article" backgroundColor="colorBackgroundBody" padding="space60">
        <Flex hAlignContent="between">
          <Heading as="h1" variant="heading10">
            Downtime Manager
          </Heading>

        {
          isReadOnly &&
          <Button variant="primary" onClick={handleBeginEdit}>Edit Configuration</Button>

        }
        {
          !isReadOnly &&
          <Stack orientation="horizontal" spacing="space40">
          <Button variant="primary" onClick={handlePublishChanges}>Publish Changes</Button>
          <Button variant="secondary" onClick={handleCancelChanges}>Cancel Changes</Button>
          </Stack>
        }
        </Flex>

        <Tabs ß>
          <TabList aria-label="My tabs">
            <Tab>Weekly Timings</Tab>
            <Tab>Emergency Downtime</Tab>

            <Tab>Holidays</Tab>
            <Tab>Partial Days</Tab>
            <Tab>General Settings</Tab>
          </TabList>
          <TabPanels paddingTop="space20">
            <TabPanel>
              <WeeklyConfig
                value={teamScheduleConfig.regularHours}
                addToStagedChanges={handleAddToUnpublishedChanges('regularHours')}
                isReadOnly={isReadOnly}
              />
            </TabPanel>
            <TabPanel>
              <EmergencyConfig
                value={teamScheduleConfig.emergencySettings}
                addToStagedChanges={handleAddToUnpublishedChanges('emergencySettings')}
                isReadOnly={isReadOnly}
              />
            </TabPanel>
            <TabPanel>
              <HolidayConfig
                value={teamScheduleConfig.holidays}
                addToStagedChanges={handleAddToUnpublishedChanges('holidays')}
                isReadOnly={isReadOnly}
              />
            </TabPanel>
            <TabPanel>
              <PartialDayConfig
                value={teamScheduleConfig.partialDays}
                addToStagedChanges={handleAddToUnpublishedChanges('partialDays')}
                isReadOnly={isReadOnly}
              />
            </TabPanel>
            <TabPanel>
              <GeneralConfig
                value={teamScheduleConfig.generalSettings}
                addToStagedChanges={handleAddToUnpublishedChanges('generalSettings')}
                isReadOnly={isReadOnly}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
     
      <Modal isOpen={showInProgress} onDismiss={()=>{}} size="default" >
       
       <ModalBody>
        
         <Flex hAlignContent="center" vAlignContent="center" minHeight={170}>
       <Spinner decorative={false}   size="sizeIcon110" title="Loading" />
       </Flex>
       </ModalBody>
       </Modal>
     
    </Theme.Provider>
  );
}
