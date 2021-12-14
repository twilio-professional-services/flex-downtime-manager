const TokenValidator = require('twilio-flex-token-validator').functionValidator;



exports.handler = TokenValidator( async function(context, event, callback) {

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');

    const client = context.getTwilioClient();

    const {SYNC_SERVICE_SID,TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME} = context;

    if(event.TokenResult.roles.indexOf("admin")<0){
        response.setBody({statusCode:"403"});     
        return callback(null, response);
      }

    const loggedInUser=  event.TokenResult.identity


  const syncService =  client.sync.services(SYNC_SERVICE_SID);


  //Remove mutex if user already has the mutex
  const exisitingDocData = await syncService.documents(TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME).fetch().then(d=>{return d.data}).catch(e=>{});
  if(null===exisitingDocData.loggedInUser || loggedInUser===exisitingDocData.loggedInUser){
    await syncService.documents(TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME).remove().catch(e=>console.error(e));
    response.setBody({statusCode:"200"});     
    return callback(null, response);
  }

  response.setBody({statusCode:"404"});     
  return callback(null, response);

    });