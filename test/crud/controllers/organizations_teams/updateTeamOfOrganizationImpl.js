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
exports._$CONTROLLERS_ = (db, responses, _) => {

    async function updateTeamOfOrganization(organizationId, teamId2, body, userId, log) {
        // check if the organization and the team exist
        if (!await db.organizations.exists({ _id: organizationId, 'teams._id': teamId2 })) throw responses.NOT_FOUND;

        let filter = {
            _id: organizationId,
            teams: {
                $elemMatch: {
                    _id: teamId2,
                }
            },
        };

        let modification = {
            $set: {
                'teams.$.name': body.name,
                'teams.$.members': body.members,
            },
        };

        let result = await db.organizations.updateOne(filter, modification);

        if (result.matchedCount === 0) throw responses.FORBIDDEN; // didn't match criteria, or was concurrently deleted

        // log.info('Updated team of organization', { organizationId, teamId2 });

        return responses.OK;
    }

    return { updateTeamOfOrganization };

}
