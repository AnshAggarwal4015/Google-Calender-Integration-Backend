const { google } = require("googleapis");

const AUTH_CLIENT_ID = `87279394821-c56eps4mlkht0spar61lf1qo6kmjpkck.apps.googleusercontent.com`;
const AUTH_CLIENT_SECRET = `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`;

const GOOGLE_CLIENT_ID = AUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = AUTH_CLIENT_SECRET;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "http://localhost:8000"
);

const calendar = google.calendar({
  version: "v3",
  auth: "AIzaSyAzgIbwnyoa6eeyDpSNk-8V3aEee5ND4Lc",
});

const scopes = [
  "profile",
  "email",
  "https://www.googleapis.com/auth/calendar",
  "openid",
];

const generateAuthorizationUrl = async (req, res, next) => {
  const authorizationUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
  });

  res.send({ url: authorizationUrl });
};

const redirect = async (req, res, next) => {
  try {
    const { code } = req.query;
    oAuth2Client.getToken(code, (err, tokens) => {
      if (err) {
        res.redirect(`http://localhost:3000`);
        return;
      }

      const refreshToken = tokens?.refresh_token;
      const frontendURL = `http://localhost:3000?refreshToken=${refreshToken}`;
      res.redirect(frontendURL);
    });
  } catch (error) {
    res.redirect(`http://localhost:3000`);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { name, email, title, startDatetime, endDatetime, refreshToken } =
      req.body;
    const startTime = new Date(startDatetime);
    const endTime = new Date(endDatetime);
    const event = {
      name: name,
      summary: title,
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      },
      attendees: [{ email: email }],
    };
    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const eventResponse = await calendar.events.insert({
      auth: oAuth2Client,
      calendarId: "primary",
      requestBody: event,
    });
    res.send({ data: eventResponse.data });
  } catch (error) {
    res.send({ error: error.message });
  }
};

module.exports = { createEvent, redirect, generateAuthorizationUrl };
