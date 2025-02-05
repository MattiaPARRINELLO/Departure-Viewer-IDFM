<h1 align="center" id="title">Departure Viewer - IDFM</h1>

<p align="center"><img src="https://socialify.git.ci/MattiaPARRINELLO/Departure-Viewer-IDFM/image?custom_description=%5BIN+DEV%5D+-+A+project+to+see+upcomming+train+for+a+given+station+using+the+%C3%8Ele-de-France+Mobilit%C3%A9+API&amp;description=1&amp;language=1&amp;name=1&amp;owner=1&amp;theme=Light" alt="project-image"></p>

<p id="description">A project to see upcomming train for a given station using the Île-de-France Mobilité API</p>

<p align="center"><img src="https://img.shields.io/badge/Hosted_with-GitHub_Pages-blue?logo=github&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/Made_with-JavaScript-blue?logo=javascript&amp;logoColor=white)" alt="shields"></p>

<h2>🚀 Demo</h2

[mattiaparrinello.github.io/IDFM-priv/](https://mattiaparrinello.github.io/IDFM-priv/)

<h2>Project Screenshots:</h2>

<img src="https://i.imgur.com/Y9kyDjk.png" alt="project-screenshot">

<h2>🧐 Features</h2>

Here're some of the project's best features:

- See upcomming trains for a specified station
- See how much time a train will be staying at the station
- Auto detect the nearest station

<h2>📜 Changelog</h2>

##### [1.0.0] - 2025-01-25

###### Added

- Initial release with basic functionality to view upcoming trains for a specified station.

##### [1.0.1] - 2025-01-26

###### Added

- Added a new feature to see how much time a train will be staying at the station.

- Added searching suggestions for the station search bar.

##### [1.0.2] - 2025-01-27

###### Added

- Auto-detect nearest station based on user's location. (Works better on mobile devices).

- Added compatibility for mobile devices.

- README.md file.

###### Fixed

- Fixed path for JSON file in index.js

##### [1.1.0] - 2025-01-31

###### Added

- Added a filter to show only the trains with a specific destination or line.
- Added a pop up to show the last update of the project automatically.

###### Fixed

- Better readability for the code.
- More comments in the code.
- Improved searching engine (previously when searching for \"Argenteuil\" it would search for \"Val d'Argenteuil\" instead of \"Argenteuil\")

#### [1.1.1] - 2025-02-01

##### Added

- Loader now shows how many departure were fetched
- Train element stays on the screen after the departure time has passed to show the user how many time the train is at station.
- If the train is at station \"🚉 ➡️\" is shown with how much time the arrival time is passed

##### Fixed

- Changed language of the HTML page
- Moved the CSS on index.html to style.css
- Fixed the geolocalisation that was not working anymore
- Fixed some train where showing NaNm NaNs of for the arrival time, this is now replaced with \"unknown\"
- Removed the \"IN DEV\" for the geolocalisation feature

#### [1.1.2] - 2025-02-05

##### Fixed

- Calling the API more frequently to get the most up to date data
- Fixed the platform time thing that made the block disapear after like 3 seconds

<h2>🛠️ Installation Steps:</h2>

<p>1. Dowload the project</p>

<p>2. Get your api key from [here](https://prim.iledefrance-mobilites.fr/)</p>

<p>3. Put your api key in the apikey.json.bak and rename it to apikey.json</p>

<p>4. Run the HTML page</p>

<p>5. (optional) Update stations data set</p>

<p>6. Download the latest table of stations</p>

```

https://data.iledefrance-mobilites.fr/explore/dataset/arrets/table/

```

<p>7. Change the path of input_file in recodeJSON to make it point to the downloaded table</p>

<p>8. Delete arrets.json</p>

<p>9. Run the python file</p>

```

python recodeJSON.py

```

<h2>💻 Built with</h2>

Technologies used in the project:

- JavaScript
- HTML
- CSS
- Siri
- IDF Mobilité API

```

```
