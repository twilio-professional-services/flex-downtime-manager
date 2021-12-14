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

      //Try to create a new mutex with a TTL of 1 hour     
      return  syncService.documents.create({
                uniqueName:TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME,
                data:{loggedInUser},
                ttl:(parseInt(TEAM_SCHEDULE_MUTEX_EXPIRY_MINUTES)*60)
            }).then(()=>{ 
                //Mutex Created successfully    
                response.setBody({statusCode:"200"});     
                return callback(null, response);

         })
        .catch(async e=>{

            //Check if user already has the mutex
            const exisitingDocData = await syncService.documents(TEAM_SCHEDULE_MUTEX_SYNC_UNIQUE_NAME).fetch().then(d=>{return d.data}).catch(e=>{});
            if(loggedInUser===exisitingDocData.loggedInUser){
                response.setBody({statusCode:"200"});     
                return callback(null, response);
            }

            //requestor cant create mutex
            response.setBody({statusCode:"403",loggedInUser});     
            return callback(null, response);
          
        })
    });