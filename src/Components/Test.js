/* global chrome */

import React, { Component } from "react";
import axios from "axios";
import UserDetails from "./UserDetails";

class Test extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
    };

    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  logIn() {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (token) {
        let zohoDetails = await axios.get(
          "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
            token
        );
        if (zohoDetails.data.email.includes("@accionlabs.com")) {
          this.setState({ email: zohoDetails.data.email });
          chrome.storage.sync.set({ email: zohoDetails.data.email }, () => {});
        } else {
          this.logOut();
          alert("Login with Accion email id");
        }
      } else {
        alert("Login error!!!");
      }
    });
  }

  logOut() {
    chrome.identity.getAuthToken(async (current_token) => {
      if (current_token) {
        await axios.get(
          "https://accounts.google.com/o/oauth2/revoke?token=" + current_token
        );
        chrome.identity.removeCachedAuthToken({ token: current_token }, () => {
          this.setState({
            email: "",
          });
        });
        chrome.storage.sync.clear(() => {});
      } else alert("ERROR");
    });
  }

  render() {
    let buttonName = this.state.email === "" ? "Login" : "Logout";
    let func = this.state.email === "" ? this.logIn : this.logOut;

    return (
      <div class="AuthPage">
        <button onClick={this.logIn}>LOG IN</button>
        <button onClick={this.logOut}> LOG OUT</button>
        {/* <button onClick={func}>{buttonName}</button> */}
        <UserDetails email={this.state.email} />
      </div>
    );
  }
}

export default Test;
