const moment = require('moment-timezone');

/*
read sync document for downtime manager configuration created by plugin
*/
const fetchTeamSchedule = (ctx,client)=>{
  const {SYNC_SERVICE_SID,TEAM_SCHEDULE_DOC_NAME} = ctx;

  return client.sync
      .services(SYNC_SERVICE_SID)
      .documents(TEAM_SCHEDULE_DOC_NAME)
      .fetch()
      .then(document =>document["data"])
      .catch((error) => null);
}

const getCurrentTimeDetails = (config)=>{
  const currentTimeZone = config["generalSettings"]["timezone"] || moment.tz.guess();
  const ccTime =  moment(moment.tz(currentTimeZone).format('MM-DD-YYYY kk:mm'),'MM-DD-YYYY kk:mm');
  
  const ccFormattedDay = ccTime.format("MM/DD/YYYY");
  const ccDayOfWeek = ccTime.format("dddd");
  return {ccTime,ccFormattedDay,ccDayOfWeek}
}


/*
check if supplied moment object lies within range of supplied time stamps in format(HH:mm)
*/

const checkIfTimeInRange=(currentTime,begin,end)=>{
      if(currentTime==null || begin==null || end==null){
       return false;
      }
      try{
        const dayConfigStart =   moment(`${currentTime.format("MM-DD-YYYY")} ${begin}`,'MM-DD-YYYY kk:mm')
        const dayConfigEnd =   moment(`${currentTime.format("MM-DD-YYYY")} ${end}`,'MM-DD-YYYY kk:mm');
        if(currentTime.isSameOrAfter(dayConfigStart) && currentTime.isSameOrBefore(dayConfigEnd)){
            return true;
        }
      }catch(e){}
      return false;
}

/*
check if supplied moment object lies within list of ranges of supplied time stamps in format(HH:mm)
*/

const checkIfTimeInListOfRanges=(currentTime,list)=>{
  if(currentTime==null || list==null || !Array.isArray(list)){
   return false;
  }
  let isInRangeList = false;
  for(listItem of list){
    isInRangeList = isInRangeList ||  checkIfTimeInRange(currentTime,listItem.begin,listItem.end)
  }
  return isInRangeList;
}


const buildAllowThroughResponse = ()=>{
  return {"allowThrough":"yes"};
}

const buildBlockResponse = (message)=>{
  return {"allowThrough":"no","offlineMessage":message||""}
}




exports.handler = async function(context, event, callback) {
 

  
const client = context.getTwilioClient();

const teamSchedule = await fetchTeamSchedule(context,client);
if(teamSchedule==null){
  // allow through if team schedule is not configured
  return callback(null,buildAllowThroughResponse())
}

try{


//get contact center time according to configured timezone
const {ccTime,ccFormattedDay,ccDayOfWeek} = getCurrentTimeDetails(teamSchedule);

// check if contact center is shut because of an emergency
if(true==teamSchedule["emergencySettings"]["emergencyShutdown"]){
      const emergencyOfflineMessage = teamSchedule["emergencySettings"]["emergencyShutdownMessage"];
      return callback(null,buildBlockResponse(emergencyOfflineMessage))
}

// check if contact center is observing a holiday
if(null!=teamSchedule["holidays"][ccFormattedDay]){       
       const holidayOfflineMessage = teamSchedule["holidays"][ccFormattedDay]["offlineMessage"];
       return callback(null,buildBlockResponse(holidayOfflineMessage))
}

// check if contact center is partially working
const partialDayLookup = teamSchedule["partialDays"][ccFormattedDay];
if(partialDayLookup!=null && !checkIfTimeInRange(ccTime,partialDayLookup["begin"],partialDayLookup["end"])){
  const partialDayOfflineMessage = partialDayLookup["offlineMessage"];
  return callback(null,buildBlockResponse(partialDayOfflineMessage))
}

// check regular hours for contact center
const regularDayLookup = teamSchedule["regularHours"]["weeklyTimings"][ccDayOfWeek];
if(regularDayLookup!=null && !checkIfTimeInListOfRanges(ccTime,regularDayLookup)){
       const outsideRegularHoursOfflineMessage =  teamSchedule["regularHours"]["offlineMessage"];
       return callback(null,buildBlockResponse(outsideRegularHoursOfflineMessage))
}




}catch(e){
  console.error(e);
}

return callback(null,buildAllowThroughResponse())

};