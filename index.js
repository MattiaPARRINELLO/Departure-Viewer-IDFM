async function getApiKey() {
    try {
        const response = await fetch("/DataSet/apikey.json");
        let data = await response.json();
        data = data.APIKey;
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
const APIUrl = "https://prim.iledefrance-mobilites.fr/marketplace"


//getstations data from city name, limit is the numer of results
//if no limit is set, all results are returned
//return an array of objects
async function getStations(cityName, limit = 0) {
    try {
        const response = await fetch("/DataSet/arrets.json");
        const stop = await response.json();
        const resultats = stop.filter(station => station.arrname.toLowerCase().includes(cityName.toLowerCase()));
        if (resultats.length <= 0) {
            console.error("No station found");
            return null;
        }
        if (limit > 0) {
            return resultats.slice(0, limit);
        }
        return resultats;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

// get line data from lineID, return an object
async function getLineData(lineID) { //lineID format : C02711 of STIF:Line::C02711:
    const simpleLineIDPattern = /^C\d{5}$/;
    const lineIDPattern = /^STIF:Line::C\d{5}:$/;
    if (!simpleLineIDPattern.test(lineID)) {
        if (!lineIDPattern.test(lineID)) {
            console.error("Invalid lineID format");
            return null;
        }
        // convert full lineID to simple lineID
        lineID = lineID.slice(11, 17);
    }
    try {
        const response = await fetch("./DataSet/lignes.json");
        const linesData = await response.json();
        const resultats = linesData.filter(line => line.id_line === lineID);
        let returnData = {
            id: resultats[0].id_line,
            name: resultats[0].name_line,
            accentColor: resultats[0].colourweb_hexa,
            textColor: resultats[0].textcolourweb_hexa,
            image: {
                url: resultats[0].picto.url,
                width: resultats[0].picto.width,
                height: resultats[0].picto.height,
                mimetype: resultats[0].picto.mimetype
            }
        }
        return returnData;


    } catch (error) {
        console.error("An error occured : ", error);
    }
}

//Call the api to get the next departures from a station
//return an unformatted object
async function getFutureTrainDepartures(stationID) { //stationID format : STIF:StopPoint:Q:41087: or 41087
    const fullStationIDPattern = /^STIF:StopPoint:Q:\d{5}:$/;
    if (!fullStationIDPattern.test(stationID)) {
        const shortStationIDPattern = /^\d{5}$/;
        if (!shortStationIDPattern.test(stationID)) {
            console.error("Invalid station ID format");
            return 'error';
        }
        stationID = `STIF:StopPoint:Q:${stationID}:`;
    }
    console.log(stationID)
    const url = `${APIUrl}/stop-monitoring?MonitoringRef=${stationID}`
    let apiKey = await getApiKey();
    console.log(apiKey)
    let response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'apikey': apiKey
        }
    })
    response = await response.json()
    return response
}



//format the next departures data
//return an array of objects (departures)
async function formatNextDepartures(data) { //data is the object returned by getFutureTrainDepartures
    let returnData = [];
    const mainData = data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
    console.log(mainData)
    for (const info of mainData) {
        let lineData = await getLineData(info.MonitoredVehicleJourney.LineRef.value)
        // see if platform is defined
        if (info.MonitoredVehicleJourney.MonitoredCall.ArrivalPlatformName === undefined) {
            info.MonitoredVehicleJourney.MonitoredCall.ArrivalPlatformName = { value: "ND" }
        }
        tempData = {
            line: lineData,
            direction: info.MonitoredVehicleJourney.DestinationName[0].value,
            mission: info.MonitoredVehicleJourney.JourneyNote[0].value,
            atStop: info.MonitoredVehicleJourney.MonitoredCall.VehicleAtStop,
            arrivalAtStationEXP: info.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime,
            departureAtStationEXP: info.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime,
            arrivalAtStationAIM: info.MonitoredVehicleJourney.MonitoredCall.AimedArrivalTime,
            status: info.MonitoredVehicleJourney.MonitoredCall.ArrivalStatus,
            platform: info.MonitoredVehicleJourney.MonitoredCall.ArrivalPlatformName.value,
            trainLenght: info.MonitoredVehicleJourney.VehicleFeatureRef[0]
        }
        returnData.push(tempData);

    }
    return returnData;
}







function updateHour() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const time = `${hours}:${minutes}:${seconds}`;
    document.getElementById('time').textContent = time;
}



setInterval(updateHour, 1000);

async function main() {
    let querry = document.getElementById("city").value
    let stationID = await getStations(querry, 1)
    stationID = stationID[0].zdaid
    let data = await getFutureTrainDepartures(stationID)
    let departures = await formatNextDepartures(data)
    document.querySelectorAll('body > div').forEach(div => {
        if (!div.classList.contains('train-info')) {
            div.remove();
        }
    });
    departures.forEach(element => {
        let div = document.createElement("div")
        div.classList.add("trainContainer")
        div.innerHTML = `
        <div class="train-item">
            <div class="logo">
                <img src="${element.line.image.url}" alt="">
                <span>${element.mission}</span>
            </div>
            <div class = "destination">${element.direction}</div>
            <div class = "time-info">${element.arrivalAtStationEXP}</div>
        </div>
        <div class="platform">${element.platform}</div>`


        document.body.appendChild(div);
    });


}


main()

document.getElementById("city").addEventListener("keypress", function (e) {
    if (e.key === 'Enter') {
        main()
    }
})  