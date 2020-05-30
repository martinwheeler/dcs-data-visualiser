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
        xAxes: [{ type: "time", time: { unit: "minutes", stepSize: 1000 }, distribution: "series", ticks: { minRotation: 1000, maxRotation: 1000 } }]
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
