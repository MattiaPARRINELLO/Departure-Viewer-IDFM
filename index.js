async function getApiKey() {
    try {
        const response = await fetch("/DataSet/apikey.json");
        const data = await response.json().APIKey;
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

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
            return [];
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
            return;
        }
        stationID = `STIF:StopPoint:Q:${stationID}:`;
    }
    const url = `${APIUrl}/stop-monitoring?MonitoringRef=${stationID}`
    fetch(url, {
        headers: {
            'Accept': 'application/json',
            'apikey': await getApiKey()
        }

    }).then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error("An error occured : ", error);
        });
}



//format the next departures data
//return an array of objects (departures)
async function formatNextDepartures(data) { //data is the object returned by getFutureTrainDepartures
    let returnData = [];
    const mainData = data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
    mainData.forEach(info => {
        getLineData(info.MonitoredVehicleJourney.LineRef.value).then(lineData => {

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

        })

    });
    return returnData;
}



let data = {
    "Siri": {
        "ServiceDelivery": {
            "ResponseTimestamp": "2025-01-24T16:33:36.670Z",
            "ProducerRef": "IVTR_HET",
            "ResponseMessageIdentifier": "IVTR_HET:ResponseMessage:61b6ae32-cb33-46a1-b338-615c1cbbed4e:LOC:",
            "StopMonitoringDelivery": [
                {
                    "ResponseTimestamp": "2025-01-24T16:33:37.452Z",
                    "Version": "2.0",
                    "Status": "true",
                    "MonitoredStopVisit": [
                        {
                            "RecordedAtTime": "2025-01-24T16:05:59.075Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147346:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::bee7b149-ae7c-4663-a2a1-8843d4863fff:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41304:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Brétigny"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "BOBA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Brétigny"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:06:01.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:06:41.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T16:05:00.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:05:40.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147347"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:09:47.654Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123534:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::4704815f-dcf5-4d56-bf9c-af7bc05e15b0:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:09:41.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:10:31.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:09:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:10:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123534"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:12:33.093Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145037:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::b09d3f10-7b86-405b-9fc8-25e8c728d480:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:12:30.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:13:10.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T16:09:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:10:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145037"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:16:02.370Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147548:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::06679289-c241-42e5-932b-4ec474a45b3d:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:412833:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Massy-Palaiseau"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "MONA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Massy-Palaiseau"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:16:00.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:16:40.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:13:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:14:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147549"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:17:08.681Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148537:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::52bfb548-6e87-46ee-8ce5-f8c83bd8c74f:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:17:00.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:17:40.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 33,
                                    "AimedArrivalTime": "2025-01-24T16:15:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:15:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148537"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:20:36.264Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123499:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::9a135982-18c7-48fb-97a2-0cfa31830641:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:20:38.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:21:18.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T16:04:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:05:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123499"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:21:27.737Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147348:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::d9316a2d-ffe1-49b8-858d-6d1686523c8a:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41304:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Brétigny"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "BOBA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Brétigny"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:21:28.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:22:08.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T16:20:00.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:20:40.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147349"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:25:27.536Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123540:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::81d9c76c-e152-4178-b7ab-4e51f1951281:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:25:26.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:26:16.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:24:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:25:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123540"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:26:36.663Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145039:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::3ad3e1ff-8eb5-4ba5-b76f-ad273e4f259c:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:26:30.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:27:10.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T16:24:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:25:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145039"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:29:39.535Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147150:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::06e13141-f93d-4ffb-a5e5-0a2713b7505c:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41326:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pont de Rungis"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ROMI"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pont de Rungis"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:29:30.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:30:10.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:28:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:29:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147151"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:32:17.759Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148139:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::f8097e26-3730-4f4a-b69c-cf362b071421:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": true,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:32:19.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:32:59.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 29,
                                    "AimedArrivalTime": "2025-01-24T16:30:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:30:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148139"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:05.625Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123507:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::2265da99-6bef-49cd-9a90-2fbe3618350d:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:35:05.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:35:45.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T16:19:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:20:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123507"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:32:25.532Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147350:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::2a57e327-63d3-4722-8c9a-d8c525fdce3d:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41304:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Brétigny"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "BOBA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Brétigny"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:35:29.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:36:09.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T16:35:00.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:35:40.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147350"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:32:57.470Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123544:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::b87671ca-6ad5-4e96-b4af-e4eb0f434c4c:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:39:30.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:40:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:39:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:40:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123544"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:25.475Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145041:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::e58184f9-fa60-49f4-937d-18c7dd80f538:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:40:01.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:40:41.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T16:39:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:40:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145041"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:09.137Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147552:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::510082ad-b1dc-4b25-91f0-0edecedac16e:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:412833:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Massy-Palaiseau"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "MONA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Massy-Palaiseau"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:44:01.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:44:41.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:43:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:44:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147553"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:23.756Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148541:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::37ae5ac5-5595-48b5-9e80-c3ddb109e438:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:45:22.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:46:02.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 33,
                                    "AimedArrivalTime": "2025-01-24T16:45:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:45:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148541"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:23.318Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123513:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::0eedcc53-1121-4af6-bd55-5b2506f782f3:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:46:58.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:47:38.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T16:34:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:35:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123513"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:03.154Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147352:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::9df0bb0a-580a-4ff3-8da3-af82e1c083f9:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41304:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Brétigny"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "BOBA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Brétigny"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:50:00.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:50:40.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T16:50:00.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:50:40.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147353"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:15.012Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123521:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::187f0637-4d90-490b-89ca-f1d449540e08:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:52:16.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:52:56.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T16:49:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:50:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123521"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:09.931Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123550:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::fa12b2ba-18b5-4352-86ca-36ca22d5e423:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:54:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:55:00.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:54:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:55:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123550"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:32:14.223Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145043:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::9776b8de-5bbb-4bbf-81d4-fe7d6c684f47:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:54:40.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:55:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T16:54:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:55:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145043"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:08.330Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147154:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::29673802-3bbf-4a5c-8563-0f54b9ead29c:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41326:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pont de Rungis"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ROMI"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pont de Rungis"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T16:58:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T16:59:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T16:58:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T16:59:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147155"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:31.348Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148143:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::7df4146d-569e-414f-94c4-f038fff423fe:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:00:19.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:00:59.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 29,
                                    "AimedArrivalTime": "2025-01-24T17:00:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:00:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148142"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:04.952Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123527:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::244a543f-b095-458a-b1fd-8e4550e5d0b5:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:04:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:05:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T17:04:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:05:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123527"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:05.600Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147354:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::5bb5fdf1-fdc3-40c7-883e-d2a1ceb8c517:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41304:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Brétigny"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "BOBA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Brétigny"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:05:00.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:05:40.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T17:05:00.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:05:40.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147355"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:32:12.315Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145045:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::2fc69f61-c6bd-4dba-9650-e9f66aeb23d1:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:09:40.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:10:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T17:09:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:10:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145044"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:03.933Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147556:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::09464526-00a8-4ee6-8b62-466d8f131aa9:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:412833:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Massy-Palaiseau"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "MONA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Massy-Palaiseau"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:13:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:14:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T17:13:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:14:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147557"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:32.966Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148545:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::4aaf0ef2-6bca-427b-8a59-2a376235df14:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:16:00.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:16:40.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 33,
                                    "AimedArrivalTime": "2025-01-24T17:15:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:15:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148544"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:07.267Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123535:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::657a9aaa-904a-47e6-bdce-ba5aa66c9452:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:19:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:20:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T17:19:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:20:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123535"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:10.398Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123560:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::3530a7b2-a90d-46ba-a13f-267b30ce90d3:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:24:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:25:00.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T17:24:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:25:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123560"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:12.644Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145047:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::044ebe23-3c92-4d99-bdac-dc770cd278a8:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:26:39.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:27:19.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T17:24:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:25:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145046"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["shortTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:08.023Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147158:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::92f5e0e1-0c0f-4b67-9d98-e0235491b878:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41326:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pont de Rungis"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ROMI"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pont de Rungis"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:28:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:28:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T17:28:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:28:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147159"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:14.591Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148147:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::81ebd1fc-294e-4180-a685-dda234b0fc79:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:33:29.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:34:09.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 29,
                                    "AimedArrivalTime": "2025-01-24T17:30:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:30:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148146"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:09.862Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123541:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::56eace70-84b1-40c5-ae6a-593224ee8cad:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:34:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:35:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T17:34:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:35:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123541"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:05.990Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123564:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::e8550775-e8fd-4ce8-8141-070f30e6756f:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:39:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:40:00.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T17:39:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:40:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123564"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:03.467Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145049:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::96ee1c61-2aac-4b33-957b-e813690d7d96:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:39:40.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:40:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T17:39:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:40:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145048"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:07.930Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147560:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::b3827480-c682-4a20-8283-6c875f9d4160:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:412833:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Massy-Palaiseau"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "MONA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Massy-Palaiseau"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:43:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:44:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T17:43:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:44:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147561"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:33:19.614Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148549:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::fbe766c7-3a83-4323-9404-4ed9f538e0e4:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:45:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:45:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 33,
                                    "AimedArrivalTime": "2025-01-24T17:45:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:45:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148549"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:05.289Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123549:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::4f38343e-e281-4c26-91f6-f48ae4fd80a2:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:49:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:50:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T17:49:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:50:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123549"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:07.161Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123570:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::d206a631-3633-4ba2-8e66-72ce1698d01f:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:54:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:55:00.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T17:54:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:55:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123570"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:08.834Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145051:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::af9b6b2a-cc65-47f9-a7a7-f442679eaae3:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:54:40.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:55:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T17:54:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:55:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145050"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:06.532Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147162:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::15a2897e-2393-4550-ac36-375f3faffddd:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41326:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pont de Rungis"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ROMI"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pont de Rungis"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T17:58:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T17:58:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T17:58:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T17:58:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147163"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:03.323Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148151:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::87c71ed5-dcfa-46f9-b388-1e3d068ee0f8:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:00:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:00:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 29,
                                    "AimedArrivalTime": "2025-01-24T18:00:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:00:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148150"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:08.990Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123555:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::424bf18e-4ae7-4720-8a7d-1d08943ca2db:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:04:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:05:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T18:04:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:05:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123555"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:07.403Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123574:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::2e3ae1f2-ebbb-4db8-b520-42b4281091f0:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ADEO"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:09:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:10:00.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T18:09:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:10:00.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123574"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T16:18:18.928Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_145053:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::cc2a1598-2e55-4ba0-b09e-53ccc51b1039:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "DepartureStatus": "cancelled",
                                    "Order": 22,
                                    "AimedArrivalTime": "2025-01-24T18:09:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:10:20.000Z",
                                    "ArrivalStatus": "cancelled"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "145052"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["shortTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:05.356Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147564:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::ccf3fed0-e9bd-4f42-b2a0-a7a9fd440866:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:412833:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Massy-Palaiseau"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "MONA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Massy-Palaiseau"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:13:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:14:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T18:13:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:14:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147565"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:04.479Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148553:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::330f3d5d-f829-4668-b3f0-dbbe1164f8dd:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:15:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:15:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 33,
                                    "AimedArrivalTime": "2025-01-24T18:15:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:15:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148553"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:09.747Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123563:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::08752dbf-aaa5-4e70-a68c-859464fed818:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:19:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:20:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T18:19:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:20:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123563"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:06.452Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123576:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::70f7ea49-2be7-4215-97a4-0f9dcc2c78bc:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "APOR"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:21:40.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:22:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T18:21:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:22:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123576"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:04.121Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147166:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::aaa01694-3dfa-4f68-b0f2-ade26dbda4c6:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41326:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pont de Rungis"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ROMI"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pont de Rungis"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:28:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:28:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T18:28:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:28:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147167"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T04:45:16.141Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123569:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::fb2de7de-63a7-4dfe-9844-7b1a350c93d8:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:34:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:35:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T18:34:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:35:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123569"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:07.408Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147568:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::ebe72ae0-34f7-48bc-8635-be16fa459fc6:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:412833:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Massy-Palaiseau"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "MONA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Massy-Palaiseau"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:43:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:44:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T18:43:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:44:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147569"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T04:45:20.191Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148557:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::d6aec4f1-ef3e-425c-a7dd-a7df3a135916:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:45:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:45:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 33,
                                    "AimedArrivalTime": "2025-01-24T18:45:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:45:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148557"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:06.025Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123577:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::c37132de-425e-4f91-96df-8c4cdbf21caf:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ODDA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:49:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:50:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 9,
                                    "AimedArrivalTime": "2025-01-24T18:49:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:50:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123577"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:07.936Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123580:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::d719a61c-377e-4c25-b928-8a2c3e3c7c15:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "APOR"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:51:40.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:52:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T18:51:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:52:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123580"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:08.949Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147170:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::d4d6e6ce-7528-4082-b497-950ecb391222:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41326:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pont de Rungis"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ROMI"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pont de Rungis"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T18:58:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T18:58:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T18:58:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T18:58:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147171"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["shortTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:05.235Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148159:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::1a3b2ba3-eb5e-4c06-a887-70773f237a99:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T19:00:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T19:00:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 29,
                                    "AimedArrivalTime": "2025-01-24T19:00:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T19:00:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148159"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:08.431Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147572:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::84bf9704-5da5-4259-a74f-253f95ec74d0:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:412833:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Massy-Palaiseau"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "MONA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Massy-Palaiseau"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T19:13:50.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T19:14:30.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T19:13:50.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T19:14:30.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147573"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["shortTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:03.715Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148561:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::84ac0156-7083-44c2-b881-07a0e588417f:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41091:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pontoise"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "NORA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pontoise"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T19:15:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T19:15:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 33,
                                    "AimedArrivalTime": "2025-01-24T19:15:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T19:15:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148560"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T04:45:18.171Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_123582:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01737:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::106d7d42-775b-42f7-9732-61e9aa7d97f4:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41071:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare du Nord"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "APOR"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare du Nord"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T19:21:40.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T19:22:20.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 6,
                                    "AimedArrivalTime": "2025-01-24T19:21:40.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T19:22:20.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "123582"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:06.706Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_147174:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::1cdf1ec8-4bbb-4bab-8bb4-b71355df1e67:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41326:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Pont de Rungis"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "ROMI"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Pont de Rungis"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T19:28:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T19:28:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 2,
                                    "AimedArrivalTime": "2025-01-24T19:28:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "2"
                                    },
                                    "AimedDepartureTime": "2025-01-24T19:28:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "147175"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["shortTrain"]
                            }
                        },
                        {
                            "RecordedAtTime": "2025-01-24T02:10:08.549Z",
                            "ItemIdentifier": "SNCF_ACCES_CLOUD:Item::41087_148163:LOC",
                            "MonitoringRef": {
                                "value": "STIF:StopPoint:Q:41087:"
                            },
                            "MonitoredVehicleJourney": {
                                "LineRef": {
                                    "value": "STIF:Line::C01727:"
                                },
                                "OperatorRef": {
                                    "value": "SNCF_ACCES_CLOUD:Operator::SNCF:"
                                },
                                "FramedVehicleJourneyRef": {
                                    "DataFrameRef": {
                                        "value": "any"
                                    },
                                    "DatedVehicleJourneyRef": "SNCF_ACCES_CLOUD:VehicleJourney::f52a3177-e587-43ab-8450-86534d128056:LOC"
                                },
                                "DirectionName": [],
                                "DestinationRef": {
                                    "value": "STIF:StopPoint:Q:41088:"
                                },
                                "DestinationName": [
                                    {
                                        "value": "Gare de Montigny Beauchamp"
                                    }
                                ],
                                "VehicleJourneyName": [],
                                "JourneyNote": [
                                    {
                                        "value": "GOTA"
                                    }
                                ],
                                "MonitoredCall": {
                                    "StopPointName": [
                                        {
                                            "value": "Gare de Franconville le Plessis Bouchard"
                                        }
                                    ],
                                    "VehicleAtStop": false,
                                    "DestinationDisplay": [
                                        {
                                            "value": "Gare de Montigny Beauchamp"
                                        }
                                    ],
                                    "ExpectedArrivalTime": "2025-01-24T19:30:10.000Z",
                                    "ExpectedDepartureTime": "2025-01-24T19:30:50.000Z",
                                    "DepartureStatus": "onTime",
                                    "Order": 29,
                                    "AimedArrivalTime": "2025-01-24T19:30:10.000Z",
                                    "ArrivalPlatformName": {
                                        "value": "1"
                                    },
                                    "AimedDepartureTime": "2025-01-24T19:30:50.000Z",
                                    "ArrivalStatus": "onTime"
                                },
                                "TrainNumbers": {
                                    "TrainNumberRef": [
                                        {
                                            "value": "148163"
                                        }
                                    ]
                                },
                                "VehicleFeatureRef": ["longTrain"]
                            }
                        }
                    ]
                }
            ]
        }
    }
}
formatNextDepartures(data).then((res) => {
    console.log(res)
})
