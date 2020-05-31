import React, { Component } from "react";
import "./App.css";

import { Line } from "react-chartjs-2";
import randomColor from 'randomcolor'
import msgpack from 'msgpack-lite'

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
      shouldPersist: false
    };

    this.mapDataToDataset = this.mapDataToDataset.bind(this);
  }

  mapDataToDataset(newData) {
    const { labels, datasets, shouldPersist } = this.state;

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

    
    const data = Object.values(newDatasets);
    this.setState({ labels: newLabels, datasets: data });

    if (shouldPersist) {
      const smallData = data.map(({data, label }) => ({ label, data: data.map(msgpack.encode) }));
      localStorage.setItem('data', JSON.stringify(smallData))
  
      const smallLabels = labels.map(l => msgpack.encode(l));
      localStorage.setItem('labels', JSON.stringify(smallLabels))
    }
  }

  componentDidMount() {
    const config = JSON.parse(localStorage.getItem('config')) || { shouldPersist: true, shouldPoll: true };
    this.setState({ ...config });

    document.addEventListener("keypress", (e) => {
      // Space
      if (e.which === 32) {
        this.setState({ shouldPoll: !this.state.shouldPoll });
      }
      if (e.which === 112) {
        this.setState({ shouldPersist: !this.state.shouldPersist });
      }
      if (e.which === 99) {
        localStorage.setItem('data', '[]');
        localStorage.setItem('labels', '[]');
        this.setState({ labels: [], datasets: [] });
      }

      localStorage.setItem('config', JSON.stringify({ shouldPersist: this.state.shouldPersist, shouldPoll: this.state.shouldPoll }))
    });

    if (config.shouldPersist) {
      const currentStorageData = JSON.parse(localStorage.getItem('data'));
      const currentStorageLabels = JSON.parse(localStorage.getItem('labels'));
  
      if (currentStorageData && currentStorageLabels && currentStorageData.length && currentStorageLabels.length) {
        const datasets = currentStorageData.map(({ label, data }) => ({ ...defaultDatasetOptions, label, data: data.map(d => msgpack.decode(d.data)), borderColor: getBorderColour(label), }))
        const labels = currentStorageLabels.map(l => msgpack.decode(l.data));
        this.setState({ labels, datasets });
      }
    }

    setInterval(() => {
      const { shouldPoll } = this.state;

      if (shouldPoll) {
        getData().then(this.mapDataToDataset);
      }
    }, POLL_TIMEOUT);
  }

  render() {
    const { shouldPoll, shouldPersist } = this.state;
    const chartOptions = {
      animation: { duration: 0 },
      hover: { animationDuration: 0 },
      responsiveAnimationDuration: 0,
      title: {
        display: true,
        text: `DCS Jet Positioning - ${shouldPoll ? "Running" : "Paused"} - ${shouldPersist ? "Persisting" : "Abandoning"}`,
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
        <div>
          <div>Controls</div>
          <div>
            <ul>
              <li>Space = Toggles Pause/Resume loading data from DCS</li>
              <li>P = Toggles whether data should be persisted between page refresh</li>
              <li>C = Clear the current data in the graph and any persisted data</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
