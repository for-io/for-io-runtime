/*!
 * for.io
 *
 * Copyright (c) 2019-2020 Nikolche Mihajlovski and EPFL
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { createApp } = require("../src/app");

const filenames = [
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

for (const filename of filenames) {
    modules[filename] = require(filename);
}

const types = require('./types-organizations');

module.exports = { createApp, appOpts: { modules, types } };