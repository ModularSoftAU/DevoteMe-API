import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import db from "../controllers/databaseController.js";

/*
    Ensure that a required field is present and has a non-null value, 
    and to return an error message if this is not the case.

    @param body Passing through the req.body
    @param field The name of the field.
    @param res Passing through res.
*/
export function required(body, field, res) {
  // Prematurely exits an API request if a required field has not been
  // defined or null. If the body is not defined then we error as well.
  // This can happen when no parameters exist.
  if (!body || !(field in body))
    return res.send({
      success: false,
      message: `Body requires field '${field}'`,
    });

  if (body[field] === null)
    return res.send({
      success: false,
      message: `Field ${field} cannot be null`,
    });

  return body[field];
}

/*
    Check if an optional field is present in the body object, and return its value if it is.

    @param body Passing through the req.body
    @param field The name of the field.
*/
export function optional(body, field) {
  // Jaedan: I am aware that this is pretty much default behaviour, however
  // this takes into consideration times where no body is included. Without
  // this check requests with only optional fields (that are all unused) will
  // cause a null object to be referenced, causing an error.
  if (!body || !(field in body) || body[field] === null) return null;

  return body[field];
}

/*
    Makes a POST API request to the specified postURL with the provided apiPostBody.
    It includes a header with the x-access-token value taken from an environment variable named APIKEY.
    If the request is successful, it logs the response data.
    If the request fails, it sets a cookie with a "danger" alert type and an error message, 
    then redirects the user to the specified failureRedirectURL.

    @param postURL The POST url that the apiPostBody will go to in the API.
    @param apiPostBody The request body for the postURL.
    @param failureRedirectURL If the request returns false, where the API will redirect the user to.
    @param res Passing through res.
*/
export async function postAPIRequest(
  postURL,
  apiPostBody,
  failureRedirectURL,
  res
) {
  const response = await fetch(postURL, {
    method: "POST",
    body: JSON.stringify(apiPostBody),
    headers: {
      "Content-Type": "application/json",
      "x-access-token": process.env.APIKEY,
    },
  });

  const data = await response.json();

  console.log(data);

  if (data.alertType) {
    setBannerCookie(`${data.alertType}`, `${data.alertContent}`, res);
  }

  if (!data.success) {
    return res.redirect(failureRedirectURL);
  }

  return console.log(data);
}