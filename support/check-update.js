const fetch = require('node-fetch');
const packageJson = require('../package.json');
const semver = require('semver');
const path = require('path');
const {exec} = require('child_process');
const gitly = require('gitly');

const handleUpdate = async (latestRelease) => {
    const currentVersion = packageJson.version;
    const latestReleaseVersion = latestRelease.tag_name;

    if (shouldUpdate(currentVersion, latestReleaseVersion)) {
        console.log(`Downloading a new version: ${latestReleaseVersion}`);
        const downloadPath = await gitly.fetch('martinwheeler/dcs-data-visualiser');
        gitly.extract(downloadPath, path.resolve(__dirname, '..'));
        console.log('Update completed.');
        exec('npm run install:all && npm run serve');
    } else {
        console.log('Already on the latest version.');
        exec('npm run serve');
    }
}

const shouldUpdate = (currentVersion, latestReleaseVersion) => {
    return semver.gt(latestReleaseVersion, currentVersion);
}

console.log('Checking for an updated version.');
fetch('https://api.github.com/repos/martinwheeler/dcs-data-visualiser/releases/latest').then(res => res.json()).then(handleUpdate);