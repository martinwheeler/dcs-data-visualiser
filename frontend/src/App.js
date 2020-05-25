import React, { Component } from "react";
import "./App.css";

import { Line } from "react-chartjs-2";

const getData = () => {
  return fetch("http://localhost:3000/data").then((response) =>
    response.json()
  );
};

const POLL_TIMEOUT = 1000;

class App extends Component {
  state = {
    labels: [],
    datasets: [
      {
        label: "Pitch",
        fill: false,
        lineTension: 1,
        borderColor: "rgb(0,0,0)",
        borderWidth: 2,
        data: [],
      },
      {
        label: "Roll",
        fill: false,
        lineTension: 25,
        borderColor: "rgb(235, 161, 2)",
        borderWidth: 2,
        data: [],
      },
      {
        label: "Yaw",
        fill: false,
        lineTension: 0.1,
        borderColor: "rgb(67, 181, 25)",
        borderWidth: 2,
        data: [],
      },
      {
        label: "PitchRate",
        fill: false,
        lineTension: 0.1,
        borderColor: "rgb(50, 117, 168)",
        borderWidth: 2,
        data: [],
      },
      {
        label: "RollRate",
        fill: false,
        lineTension: 0.1,
        borderColor: "rgb(139, 50, 168)",
        borderWidth: 2,
        data: [],
      },
      {
        label: "YawRate",
        fill: false,
        lineTension: 0.1,
        borderColor: "rgb(199, 22, 22)",
        borderWidth: 2,
        data: [],
      },
    ],
    shouldPoll: true,
  };

  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // Space
      if (e.which === 32) {
        this.setState({ shouldPoll: !this.state.shouldPoll });
      }
    });

    setInterval(() => {
      const { labels, datasets, shouldPoll } = this.state;

      if (shouldPoll) {
        getData().then((newData) => {
          console.log('Data Length: ', newData.length);

          const newLabels = labels.concat(newData.map(data => data.timestamp));

          const { newPitchDataset, newRollDataset, newYawDataset, newPitchRateDataset, newRollRateDataset, newYawRateDataset } = newData.reduce((result, nextData) => {
            return {
              ...result,
              newPitchDataset: [...result.newPitchDataset, nextData.pitch],
              newRollDataset: [...result.newRollDataset, nextData.roll],
              newYawDataset: [...result.newYawDataset, nextData.yaw],
              newPitchRateDataset: [...result.newPitchRateDataset, nextData.pitchRate],
              newRollRateDataset: [...result.newRollRateDataset, nextData.rollRate],
              newYawRateDataset: [...result.newYawRateDataset, nextData.yawRate],
            };
          }, { newPitchDataset: datasets[0].data, newRollDataset: datasets[1].data, newYawDataset: datasets[2].data, newPitchRateDataset: datasets[3].data, newRollRateDataset: datasets[4].data, newYawRateDataset: datasets[5].data });

          const newDatasets = [
            {
              ...datasets[0],
              data: newPitchDataset,
            },
            {
              ...datasets[1],
              data: newRollDataset,
            },
            {
              ...datasets[2],
              data: newYawDataset,
            },
            {
              ...datasets[3],
              data: newPitchRateDataset,
            },
            {
              ...datasets[4],
              data: newRollRateDataset,
            },
            {
              ...datasets[5],
              data: newYawRateDataset,
            },
          ];

          this.setState({ labels: newLabels, datasets: newDatasets });
        });
      }
    }, POLL_TIMEOUT);
  }

  render() {
    const { shouldPoll } = this.state;

    return (
      <div className="App">
        <Line
          data={this.state}
          options={{
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
              xAxes: [{ type: "time", time: { unit: "millisecond", stepSize: 1000 }, distribution: "series", ticks: { minRotation: 1000, maxRotation: 1000 } }]
            }
          }}
        />
        <div>Press Space to pause or resume fetching more results.</div>
      </div>
    );
  }
}

export default App;
