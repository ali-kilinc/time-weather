document.addEventListener("DOMContentLoaded", function() {
  
  const openWeatherApiAccessKey = "608fa07023d21aaff068c830ef4fdc41"  // limited free public access key
  const openWeatherApiUrl = "http://api.openweathermap.org/data/2.5/weather?appid=" + openWeatherApiAccessKey
  
  let openWeatherRequest = obj => {
    return new Promise((resolve, reject) => {

      let xhr = new XMLHttpRequest();
      xhr.open("GET", obj.url)
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response)
        } else {
          reject(xhr.statusText)
        }
      };
      xhr.onerror = () => reject(xhr.statusText)
      xhr.send(obj.body)
    });
  };

  document.getElementById("timeWeatherForm").addEventListener("submit", submitTimeWeatherForm)

  function submitTimeWeatherForm(event)
  {
    event.preventDefault()

    let queryResults = "<ul>"
    const arrInputs = document.getElementById("locations").value.split(',')
    const regPostalCode = /^\d+$/
    let city, postalCode, arrLocations = []

    // get all locations from the form
    for(let i=0; i<arrInputs.length; i++){

      city = null
      postalCode = null

      let input = arrInputs[i].trim()

      if(input.length == 0)
        continue;

      if(regPostalCode.test(input)){
        postalCode = input
      }
      else{
        city = input
        
        if(i < arrInputs.length - 1){
          
          input = arrInputs[i+1].trim()
          if(regPostalCode.test(input)){
            postalCode = input;
            i++;
          }
        }
      }
      arrLocations.push({'city' : city, 'postalCode' : postalCode})
    }
    
    // make query for all locations and show results 
    qureyLocations(arrLocations).then(results => { 
      queryResults += results 
      queryResults += "</ul>"
      document.getElementById("timeWeatherResults").innerHTML = queryResults
    })
  }

  async function qureyLocations(arrLocations){

    let results = ""

    for(let i=0; i<arrLocations.length; i++)
    {
      let loc = arrLocations[i];
      let apiRequestUrl;
      // if postal code information exists, first we should query country code by using city
      // if city is null, default country code US will be used
      if(loc.postalCode){
        
        let countryCode = "US"
        if(loc.city){
          try{
            countryCode = await getCountryCodeForCity(loc.city)
          } catch(error) {
            results += createErrorResultForLocation(loc, error)
            continue
          }
        }
        // consturct url to request using postal code and country information
        apiRequestUrl = openWeatherApiUrl + "&zip=" + loc.postalCode + "," + countryCode
      }
      // no postal code information given, construct url directly using city 
      else {
        apiRequestUrl = openWeatherApiUrl + "&q=" + loc.city
      }

      // make the request
      try{
        const timeAndWeatherData = await openWeatherRequest({ url: apiRequestUrl })
        results += evaluateTimeAndWeatherData(loc, timeAndWeatherData)
      }catch(error) {
        results += createErrorResultForLocation(loc, error)
      }
    }
    return results
  }

  async function getCountryCodeForCity(city){
    
    const apiUrlCountryCode = openWeatherApiUrl + "&q="+ city
    
    let countryCodeData = await openWeatherRequest({ url: apiUrlCountryCode })
    let countryCodeResult = JSON.parse(countryCodeData)
    if (countryCodeResult.cod == 200 && countryCodeResult.sys && countryCodeResult.sys.country) {
      return countryCodeResult.sys.country
    } else {
      throw new Error(countryCodeResult.message)
    }
  }

  function evaluateTimeAndWeatherData(loc, timeAndWeatherData){

    let results = ""
    let timeAndWeatherResult = JSON.parse(timeAndWeatherData)
    
    if(timeAndWeatherResult.cod == 200){
      results += createResultForLocation(loc, timeAndWeatherResult)
    }
    else{
      results += createErrorResultForLocation(loc, timeAndWeatherResult.message)
    }
    return results
  }

  function createErrorResultForLocation(loc, detailedMessage){
    return "<li style='color:red'>Something went wrong for " + ((loc.city) ? loc.city : "") + " " + 
      ((loc.postalCode) ? loc.postalCode : "") + ((detailedMessage) ? ":" + detailedMessage : ".") + "</li>"
  }

  function createResultForLocation(loc, apiResult){
   
    var currentTime = new Date();
    var targetTimeInMs = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000) + (apiResult.timezone * 1000);
    var targetUtc = apiResult.timezone / 3600;

    return "<li>" + ((loc.city) ? loc.city : "") + ((loc.postalCode) ? " " + loc.postalCode + ", " + apiResult.name : "") + " ==> Time: " + 
            new Date(targetTimeInMs).toLocaleString() + " / UTC" + ((targetUtc > 0) ? "+" : "") + targetUtc + ", Weather: " +
            apiResult.weather[0].main + ", " + kelvinToCelsiusPresentation(apiResult.main.temp)
  }

  function kelvinToCelsiusPresentation(kelvin) {
    if (kelvin < (0)) {
      return 'below absolute zero (0 K)';
    } 
    else {
      return Math.round(kelvin-273.15) + "&#8451;"
    }
  }
})
