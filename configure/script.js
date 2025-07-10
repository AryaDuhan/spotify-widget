const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const code = urlParams.get("code") || "";

const baseURL = "https://aryaduhan.github.io/spotify-widget";
const redirect_uri = `${baseURL}/configure/`;
let refresh_token = "";
let access_token = "";
let browserSourceURL = "";

function RequestAuthorization() {
  const client_id = document.getElementById("client_id_box").value;
  const client_secret = document.getElementById("client_secret_box").value;
  localStorage.setItem("client_id", client_id);
  localStorage.setItem("client_secret", client_secret);

  let url = "https://accounts.spotify.com/authorize";
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  url +=
    "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url;
}

if (code != "") {
  FetchAccessToken(code);
} else {
  document.getElementById("connectBox").style.display = "inline";
}

async function FetchAccessToken(code) {
  const client_id = localStorage.getItem("client_id");
  const client_secret = localStorage.getItem("client_secret");
  console.debug(`Client ID: ${client_id}`);
  console.debug(`Client Secret: ${client_secret}`);

  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  console.log(body);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(client_id + ":" + client_secret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });

  if (response.ok) {
    const responseData = await response.json();
    console.debug(responseData);
    refresh_token = responseData.refresh_token;
    access_token = responseData.access_token;

    browserSourceURL = `${baseURL}?client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}`;
    document.getElementById("authorizationBox").style.display = "inline";
  } else {
    console.error(`${response.status}`);
  }
}

const clientIdBox = document.getElementById("client_id_box");
const clientSecretBox = document.getElementById("client_secret_box");
const authorizeButton = document.getElementById("authorizeButton");

function checkInputs() {
  if (clientIdBox.value.trim() === "" || clientSecretBox.value.trim() === "") {
    authorizeButton.disabled = true;
  } else {
    authorizeButton.disabled = false;
  }
}

clientIdBox.addEventListener("input", checkInputs);
clientSecretBox.addEventListener("input", checkInputs);

checkInputs();

function CopyToURL() {
  navigator.clipboard.writeText(browserSourceURL);

  document.getElementById("copyURLButton").innerText = "Copied to clipboard";
  document.getElementById("copyURLButton").style.backgroundColor = "#00dd63";
  document.getElementById("copyURLButton").style.color = "#ffffff";

  setTimeout(() => {
    document.getElementById("copyURLButton").innerText = "Click to copy URL";
    document.getElementById("copyURLButton").style.backgroundColor = "#ffffff";
    document.getElementById("copyURLButton").style.color = "#181818";
  }, 3000);
}
