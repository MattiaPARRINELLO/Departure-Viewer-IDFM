<h1 align="center" id="title">Departure Viewer - IDFM</h1>

<p align="center"><img src="https://socialify.git.ci/MattiaPARRINELLO/Departure-Viewer - IDFM/image?custom_description=%5BIN+DEV%5D+-+A+project+to+see+upcomming+train+for+a+given+station+using+the+%C3%8Ele-de-France+Mobilit%C3%A9+API&amp;description=1&amp;language=1&amp;name=1&amp;owner=1&amp;theme=Light" alt="project-image"></p>

<p id="description">A project to see upcomming train for a given station using the Île-de-France Mobilité API</p>

<p align="center"><img src="https://img.shields.io/badge/Hosted_with-GitHub_Pages-blue?logo=github&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/Made_with-JavaScript-blue?logo=javascript&amp;logoColor=white)" alt="shields"></p>

<h2>🚀 Demo</h2>

[mattiaparrinello.github.io/IDFM-priv/](https://mattiaparrinello.github.io/IDFM-priv/)

<h2>Project Screenshots:</h2>

<img src="https://i.imgur.com/Y9kyDjk.png" alt="project-screenshot" width="400" height="400/">

<h2>🧐 Features</h2>

Here're some of the project's best features:

- See upcomming trains for a specified station
- See how much time a train will be staying at the station
- [INDEV] - Auto detect the nearest station

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
