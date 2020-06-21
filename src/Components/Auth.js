/* global chrome */
import React, { Component } from "react";
import axios from "axios";
import "../Auth.css";
import { Button } from "semantic-ui-react"

class Auth extends Component {
  constructor() {
    super();
    this.state = {
      isLogged: false,
      email: "",
      isLoading: false,
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  logIn() {
    try {
      this.setState({ isLoading: true });
      chrome.identity.getAccounts((acc) => {
        alert(acc);
      })
      // chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      //   if (token) {
      //     let oAuthGoogle = await axios.get(
      //       "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
      //         token
      //     );
      //     if (oAuthGoogle.data.email.includes("@accionlabs.com")) {
      //       await axios.get("http://intranet.accionlabs.com:3001/");
      //       chrome.storage.sync.set(
      //         { email: oAuthGoogle.data.email, isLogged: true },
      //         () => {
      //           this.setState({
      //             email: oAuthGoogle.data.email,
      //             isLogged: true,
      //             isLoading: false,
      //           });
      //         }
      //       );
      //     } else {
      //       this.logOut();
      //       alert("Login with Accion email id");
      //     }
      //   } else {
      //     alert("Login error!!!");
      //   }
      // });
      // this.logIn()
    } catch (err) {
      alert(err);
    }
  }

  logOut() {
    try {
      this.setState({ isLoading: true });
      chrome.identity.getAuthToken(async (current_token) => {
        if (current_token) {
          await axios.get(
            "https://accounts.google.com/o/oauth2/revoke?token=" + current_token
          );
          chrome.identity.removeCachedAuthToken(
            { token: current_token },
            () => {
              this.setState({
                email: "",
                isLogged: false,
                isLoading: false,
              });
            }
          );
          chrome.storage.sync.clear(() => {});
        } else {
          this.setState({
            email: "",
            isLogged: false,
            isLoading: false,
          });
        }
      });
    } catch (err) {
      alert(err);
    }
  }

  componentDidMount() {
    chrome.storage.sync.get(["email", "isLogged"], (value) => {
      if (value.email) {
        this.setState({
          email: value.email,
          isLogged: true,
        });
      }
    });
  }

  render() {
    return (
      <div>
        <Button>Login</Button>
        {/* {this.state.isLoading ? (
          "loading..."
        ) : (
          <div>
            {this.state.isLogged ? (
              <div className="homeScreen">
                <button className="homeLogInButton" onClick={this.logOut}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="homeScreen">
                <button className="homeLogButton" onClick={this.logIn}>
                  Login
                </button>
              </div>
            )}
          </div>
        )} */}
      </div>
    );
  }
}

export default Auth;
