import React, { Component } from "react";
import "./App.css";

import { Line } from "react-chartjs-2";
import randomColor from 'randomcolor'

const getData = () => {
  return fetch("http://localhost:3000/data").then((response) =>
    response.json()
  );
};

const getBorderColour = (key) => {
  return randomColor({ seed: key, format: 'rgb', luminosity: 'bright' });
}

const POLL_TIMEOUT = 1000;
const defaultDatasetOptions = {
  label: 'Undefined',
  fill: false,
  lineTension: 0.1,
  borderColor: "rgb(199, 22, 22)",
  borderWidth: 1,
  data: []
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labels: [],
      datasets: [],
      shouldPoll: true,
      shouldPersist: true
    };

    this.mapDataToDataset = this.mapDataToDataset.bind(this);
  }

  mapDataToDataset(newData) {
    const { labels, datasets } = this.state;

    const newLabels = labels.concat(newData.map(data => data.timestamp));
    const newDatasets = datasets.reduce((result, currentDataset) => {
      return {
        ...result,
        [currentDataset.label]: {
          ...currentDataset
        }
      }
    }, {})

    newData.forEach((currentDataEntry) => {
      const allKeysExcludingTimestamp = Object.keys(currentDataEntry).filter(key => key !== 'timestamp');

      allKeysExcludingTimestamp.forEach(currentKey => {
        if (newDatasets[currentKey]) {
          newDatasets[currentKey] = {
            ...newDatasets[currentKey],
            data: [
              ...newDatasets[currentKey].data,
              currentDataEntry[currentKey]
            ]
          }
        } else {
          newDatasets[currentKey] = {
            ...defaultDatasetOptions,
            label: currentKey,
            borderColor: getBorderColour(currentKey),
            data: [
              currentDataEntry[currentKey]
            ]
          }
        }
      });
    });

    this.setState({ labels: newLabels, datasets: Object.values(newDatasets) });
  }

  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // Space
      if (e.which === 32) {
        this.setState({ shouldPoll: !this.state.shouldPoll });
      }
      if (e.which === 'P') {
        this.setState({ shouldPersist: !this.state.shouldPersist });
      }
      if (e.which === 'C') {
        // TODO: Clear localStorage
      }
    });

    setInterval(() => {
      const { shouldPoll } = this.state;

      if (shouldPoll) {
        getData().then(this.mapDataToDataset);
      }
    }, POLL_TIMEOUT);
  }

  render() {
    const { shouldPoll } = this.state;
    const chartOptions = {
      animation: { duration: 0 },
      hover: { animationDuration: 0 },
      responsiveAnimationDuration: 0,
      title: {
        display: true,
        text: `DCS Jet Positioning - ${shouldPoll ? "Running" : "Paused"}`,
        fontSize: 20,
      },
      legend: {
        display: true,
        position: "right",
      },
      scales: {
        xAxes: [{ type: "time" }]
      },
      tooltips: {
        mode: 'index'
      }
    }

    return (
      <div className="App">
        <Line
          data={this.state}
          options={chartOptions}
        />
        <div>Press Space to pause or resume fetching more results.</div>
      </div>
    );
  }
}

export default App;
