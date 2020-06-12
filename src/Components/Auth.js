// /* global chrome */
import React, { Component } from "react";
import axios from "axios";
// import UserDetails from "../Display/UserDetails";

class Auth extends Component {
  constructor() {
    super();
    this.state = {
      // buttonName: true,
      // color: "green",
      // email: "",
      userName: "",
    };
    this.zohoAPI = this.zohoAPI.bind(this)
    // this.loginFunction = this.loginFunction.bind(this);
  }
  // loginFunction() {
  //   this.setState(async (prevState) => {
  //     if (prevState.buttonName) {
  //       setTimeout(() => {
  //         let userDetails
  //       }, 2000)
  //       chrome.identity.getAuthToken({ interactive: true }, async (token) => {
  //         let userDetails = await axios.get(
  //           "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
  //             token
  //         );
  //         return {
  //           buttonName: !prevState.buttonName,
  //           email: userDetails.data.email,
  //         };
  //       });
  //     }
  //   });
  // }

  // componentDidMount(){
  //   this.loginFunction()
  // }

  async zohoAPI() {
    let zohoURL =
      "https://people.zoho.com/people/api/forms/P_EmployeeView/records?authtoken=431fce4ebc4618dfc90d7c114f5e00f7&searchColumn=EMPLOYEEMAILALIAS&searchValue=";
    let email = "nareshkumar.bn@accionlabs.com";
    let name = await axios.get(zohoURL + email);
    console.log(name.data);
    
    if (name.data) {
      this.setState({
        userName: name.data[0]["First Name"],
      });
    }
    else {
      this.setState({
        userName: "Something went wrong"
      })
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.zohoAPI}>Login</button>
        <h1>{this.state.userName}</h1>
      </div>
    );
  }
}

export default Auth;
