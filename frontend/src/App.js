import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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

          const newLabels = newData.reduce((result, nextData) => {
            return [
              ...result,
              nextData.timestamp
            ];
          }, labels);

          const newPitchDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.pitch];
          }, datasets[0].data);

          const newBankDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.roll];
          }, datasets[1].data);

          const newYawDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.yaw];
          }, datasets[2].data);

          const newPitchRateDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.pitchRate];
          }, datasets[3].data);

          const newBankRateDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.rollRate];
          }, datasets[4].data);

          const newYawRateDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.yawRate];
          }, datasets[5].data);

          const newDatasets = [
            {
              ...datasets[0],
              data: newPitchDataset,
            },
            {
              ...datasets[1],
              data: newBankDataset,
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
              data: newBankRateDataset,
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
        <div style={{ position: 'absolute', top: 0, left: 0}}>Status: <span>{shouldPoll ? "Running" : "Paused"}</span></div>
        <Line
          data={this.state}
          options={{
            animation: { duration: 0 },
            hover: { animationDuration: 0 },
            responsiveAnimationDuration: 0,
            title: {
              display: true,
              text: "DCS Jet Positioning",
              fontSize: 20,
            },
            legend: {
              display: true,
              position: "right",
            },
            scales: {
              xAxes: [ { type: "time", time: { unit: "millisecond", stepSize: 1000 }, distribution: "series", ticks: { minRotation: 1000, maxRotation: 1000 } } ]
            }
          }}
        />
      </div>
    );
  }
}

export default App;
