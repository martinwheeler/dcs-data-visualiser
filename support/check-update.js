const fetch = require('node-fetch');
const packageJson = require('../package.json');
const semver = require('semver');
const path = require('path');
// import { fetch, extract } = from 'gitly'
const gitly = require('gitly');

const handleUpdate = async (latestRelease) => {
    const currentVersion = packageJson.version;
    const latestReleaseVersion = latestRelease.tag_name;

    if (shouldUpdate(currentVersion, latestReleaseVersion)) {
        // TODO: Download new ZIP
        const downloadPath = await gitly.fetch('martinwheeler/dcs-data-visualiser');
        console.log('DL PATH: ', downloadPath)

        gitly.extract(downloadPath, path.resolve(__dirname, '..'));
    }
}

const shouldUpdate = (currentVersion, latestReleaseVersion) => {
    return semver.gt(latestReleaseVersion, currentVersion);
}

fetch('https://api.github.com/repos/martinwheeler/dcs-data-visualiser/releases/latest').then(res => res.json()).then(handleUpdate);