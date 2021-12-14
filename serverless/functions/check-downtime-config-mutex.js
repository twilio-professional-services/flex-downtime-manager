const TokenValidator = require('twilio-flex-token-validator').functionValidator;



exports.handler = TokenValidator( async function(context, event, callback) {

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');

    const client = context.getTwilioClient();

    const {SYNC_SERVICE_SID,TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME,TEAM_SCHEDULE_MUTEX_EXPIRY_MINUTES} = context;


    if(event.TokenResult.roles.indexOf("admin")<0){
        response.setBody({statusCode:"403",roles:event.TokenResult.roles});     
        return callback(null, response);
      }

    const loggedInUser=  event.TokenResult.identity

    


  const syncService =  client.sync.services(SYNC_SERVICE_SID);


        const exisitingDocData = await syncService.documents(TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME).fetch().then(d=>{return d.data}).catch(e=>{});
        if(exisitingDocData!=null && loggedInUser===exisitingDocData.loggedInUser){
            response.setBody({statusCode:"200",hasExistingMutex:true});     
            return callback(null, response);
        }

        response.setBody({statusCode:"200",hasExistingMutex:false});     
        return callback(null, response);
    });