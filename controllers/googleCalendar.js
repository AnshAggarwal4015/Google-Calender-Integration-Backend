const { google } = require("googleapis");

const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID;
const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET;

const GOOGLE_CLIENT_ID = AUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = AUTH_CLIENT_SECRET;
const Base_url = process.env.REACT_BASE_URL;
const serviceURL = process.env.SERVICE_URL;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  serviceURL
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
        res.redirect(`${Base_url}`);
        return;
      }

      const refreshToken = tokens?.refresh_token;
      const frontendURL = `${Base_url}?refreshToken=${refreshToken}`;
      res.redirect(frontendURL);
    });
  } catch (error) {
    res.redirect(`${Base_url}`);
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
