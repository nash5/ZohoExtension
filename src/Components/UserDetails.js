import React, { Component } from "react";
import axios from "axios";

class UserDetails extends Component {
  constructor() {
    super();
    this.state = {
      userName: "",
    };
  }

  async getUserDetails() {
    // let zohoURL =
    //   "https://people.zoho.com/people/api/forms/P_EmployeeView/records?authtoken=431fce4ebc4618dfc90d7c114f5e00f7&searchColumn=EMPLOYEEMAILALIAS&searchValue=";
    // let email = this.props.email;
    // alert(email);
    let name = axios.get('https://people.zoho.com/people/api/forms/P_EmployeeView/records?authtoken=431fce4ebc4618dfc90d7c114f5e00f7&searchColumn=EMPLOYEEMAILALIAS&searchValue=nareshkumar.bn@accionlabs.com');
    alert(name.data);
    this.setState({
      userName: name.data[0].FirstName,
    });
  }

  componentDidUpdate() {
    this.getUserDetails();
  }

  render() {
    return (
      <div>
        <h3>Display something {this.state.userName}</h3>
      </div>
    );
  }
}

export default UserDetails;
