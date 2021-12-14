const TokenValidator = require('twilio-flex-token-validator').functionValidator;



exports.handler = TokenValidator( async function(context, event, callback) {

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');

    const client = context.getTwilioClient();

    const {SYNC_SERVICE_SID,TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME,TEAM_SCHEDULE_DOC_NAME} = context;

    if(event.TokenResult.roles.indexOf("admin")<0){
        response.setBody({statusCode:"403"});     
        return callback(null, response);
      }
    const loggedInUser=  event.TokenResult.identity


  const syncService =  client.sync.services(SYNC_SERVICE_SID);


  //Check if user has the mutex for updated config
  const exisitingDocData = await syncService.documents(TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME).fetch().then(d=>{return d.data}).catch(e=>{});
  if(loggedInUser!=exisitingDocData.loggedInUser){
    response.setBody({statusCode:"401"});     
    return callback(null, response);
  }

  const responseStatusCode = await syncService.documents(TEAM_SCHEDULE_DOC_NAME).update({data: event.downtimeConfig}).then(d=>"200").catch(e=>"500");
  response.setBody({statusCode:responseStatusCode});     
  return callback(null, response);



    });