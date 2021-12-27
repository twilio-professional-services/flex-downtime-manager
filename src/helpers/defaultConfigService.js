import moment from 'moment-timezone';
const { REACT_APP_SERVICE_BASE_URL } = process.env;

export const fetchTimezoneList = async ()=>{
   
       return await fetch(`${REACT_APP_SERVICE_BASE_URL}/timezone-options.json`).then(d=>d.json()).catch(e=>moment.tz.names())
   
   }