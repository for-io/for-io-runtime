const { createApp } = require("../../src/app");

const moduleNames = [
    "./controllers/organizations/addOrganizationImpl",
    "./controllers/organizations/updateOrganizationImpl",
    "./controllers/organizations/deleteOrganizationImpl",
    "./controllers/organizations/getOrganizationImpl",
    "./controllers/organizations/listOrganizationsImpl",
    "./controllers/organizations_teams/addTeamToOrganizationImpl",
    "./controllers/organizations_teams/updateTeamOfOrganizationImpl",
    "./controllers/organizations_teams/deleteTeamOfOrganizationImpl",
    "./controllers/organizations_teams/getTeamOfOrganizationImpl",
    "./controllers/organizations_teams/listTeamsOfOrganizationImpl"
];

const modules = {};

for (const moduleName of moduleNames) {
    modules[moduleName] = require(moduleName);
}

const types = require('./crud-types');
const routes = require('./crud-routes');

module.exports = { createApp, appOpts: { modules, types, routes } };