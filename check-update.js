const fetch = require('node-fetch');
const packageJson = require('./package.json');
const semver = require('semver');
const path = require('path');
const gitly = require('gitly');
const execSync = require("child_process").execSync;

var SEPARATOR = process.platform === "win32" ? ";" : ":",
    env = Object.assign({}, process.env);

env.PATH = path.resolve("./node_modules/.bin") + SEPARATOR + env.PATH;

function myExec(cmd) {
    execSync(cmd, {
        cwd: process.cwd(),
        env: env
    });
}

const handleUpdate = async (latestRelease) => {
    const currentVersion = packageJson.version;
    const latestReleaseVersion = latestRelease.tag_name;

    if (shouldUpdate(currentVersion, latestReleaseVersion)) {
        console.log(`Downloading a new version: ${latestReleaseVersion}`);
        const downloadPath = await gitly.fetch(`martinwheeler/dcs-data-visualiser#${latestReleaseVersion}`, { cache: false });
        console.log('Download finished:', downloadPath);
        console.log('Preparing for extraction.');
        await gitly.extract(downloadPath, path.resolve(__dirname, '..'));
        console.log('Extraction finished. Installing new dependencies.');
        myExec('start powershell -command "& npm run install:all; exit"');
        console.log('Update completed.');
        console.log('Booting app.');
        myExec('start powershell -command "& npm run serve"');
    } else {
        console.log('Already on the latest version.');
        myExec('start powershell -command "& npm run serve"');
    }
}

const shouldUpdate = (currentVersion, latestReleaseVersion) => {
    return semver.gt(latestReleaseVersion, currentVersion);
}

console.log('Checking for an updated version.');
fetch('https://api.github.com/repos/martinwheeler/dcs-data-visualiser/releases/latest').then(res => res.json()).then(handleUpdate);