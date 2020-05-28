# DCS Data Visualiser

This tool has been developed to capture data from DCS during gameplay and display it in a graph.

# Installation

## Requirements

- [Node](https://nodejs.org/dist/v12.16.3/node-v12.16.3-x64.msi)
  - Note: Make sure to tick the checkbox to install extra required tools like chocolatey etc

## Quick Start

Make sure to install [Node](https://nodejs.org/dist/v12.16.3/node-v12.16.3-x64.msi) before following the below steps.

1. Download the latest ZIP [here](https://github.com/martinwheeler/dcs-data-visualiser/releases).
2. Unzip the files to a location of your preference.
3. Run `install.ps1` to install the project dependencies.
4. Run `start.ps1` to run the project.
5. Open `http://localhost:8080` in your web browser to view the captured data.
6. Copy the `Export.lua` file to the folder `%USERPROFILE%\Saved Games\DCS\Scripts`

## Details

There are three parts to this tool:

1. A node server listening to UDP port 41230
2. A React app to serve the collated data via graphs
3. `Export.lua` to fetch the data from DCS

To capture the data from DCS we must tap into the game with the use of a LUA file. The `Export.lua` file is loaded by DCS during gameplay and allows capturing data that the game utilises for flight. The `Export.lua` formats the data into JSON and then sends it via a UDP port. Port 41230 on localhost.

The node server waits for data to be sent on UDP port 41230 and once received it saves it to a log file. The data is also stored in memory ready to be loaded by the web app (graph). Once the data has been loaded into the graph it is cleared from memory, so performing a refresh in the browser will empty the graph ready for the next flight.

## Issues

If you are getting an error about the execution policy in PowerShell run the following command:

Set-ExecutionPolicy Unrestricted