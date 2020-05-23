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

const POLL_TIMEOUT = 50;

class App extends Component {
  state = {
    labels: [],
    datasets: [
      {
        label: "X",
        fill: false,
        lineTension: 1,
        borderColor: "rgba(2,43,56,1)",
        borderWidth: 2,
        data: [],
      },
      {
        label: "Y",
        fill: false,
        lineTension: 25,
        borderColor: "rgba(123,43,54,1)",
        borderWidth: 2,
        data: [],
      },
      {
        label: "Z",
        fill: false,
        lineTension: 0.1,
        borderColor: "rgba(1,255,34,1)",
        borderWidth: 2,
        data: [],
      },
    ],
    shouldPoll: false,
  };

  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      console.log(e);
      // Space
      if (e.which === 32) {
        this.setState({ shouldPoll: !this.state.shouldPoll });
      }
    });

    setInterval(() => {
      const { labels, datasets, shouldPoll } = this.state;

      if (shouldPoll) {
        getData().then((newData) => {
          const newLabels = newData.reduce((result, nextData) => {
            return [
              ...result,
              dayjs(nextData.timestamp).format("hh:mm:ss:SSS"),
            ];
          }, labels);

          const newXDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.x];
          }, datasets[0].data);

          const newYDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.y];
          }, datasets[1].data);

          const newZDataset = newData.reduce((result, nextData) => {
            return [...result, nextData.data.z];
          }, datasets[2].data);

          const newDatasets = [
            {
              ...datasets[0],
              data: newXDataset,
            },
            {
              ...datasets[1],
              data: newYDataset,
            },
            {
              ...datasets[2],
              data: newZDataset,
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
        Status: <span>{shouldPoll ? "Running" : "Paused"}</span>
        <Line
          data={this.state}
          options={{
            title: {
              display: true,
              text: "DCS Jet Positioning",
              fontSize: 20,
            },
            legend: {
              display: true,
              position: "right",
            },
          }}
        />
      </div>
    );
  }
}

export default App;
