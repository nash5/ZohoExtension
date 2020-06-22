/* global chrome */

import React, { Component } from "react";
import axios from "axios";
// import App from "../App";
import lottie from "lottie-web";
import moment from "moment";

import {
  Button,
  Card,
  Image,
  Icon,
  Segment,
  Accordion,
} from "semantic-ui-react";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      photo: "",
      email: "",
      employeeId: "",
      checkStatus: false,
      checkedMessage: "",
      successRes: "",
      isLogged: false, // Login switch
      isLoading: false, //Loading switch
      activeIndex: 1, // Accordian handler index
      time: "",
      workingHours:"00:00", 
      tsecs: 0,
    };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.checkInOrOut = this.checkInOrOut.bind(this);
    this.getAttendanceDetails = this.getAttendanceDetails.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
  }

  // To handle accordian
  accordianHandleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  async getUserDetails(emailId) {
    try {
      let employeDetails = await axios.get(
        "http://intranet.accionlabs.com:3001/employee/userDetails/" + emailId
      );
      const { email, name, photo, employeeId } = employeDetails.data.result;
      if (employeDetails.data.result) {
        chrome.storage.sync.set(
          {
            email: email,
            name: name,
            photo: photo,
            employeeId: employeeId,
            isLogged: true,
          },
          () => {
            if(chrome.runtime.lastError){
              let err = chrome.runtime.lastError;
              console.log(err);
            }
            this.setState({
              email: email,
              name: name,
              photo: photo,
              employeeId: employeeId,
              isLogged: true,
              isLoading: false,
            });
          }
        );
      } else if (chrome.runtime.lastError) {
        console.log("Error");
      } else {
        alert("Nothing happened");
      }
    } catch (err) {
      if (chrome.runtime.lastError) {
        console.log("error");
      } else {
        alert(err);
      }
    }
  }

  async getAttendanceDetails() {
    try {
      let zohoURL =
        "http://intranet.accionlabs.com:3001/employee/attendanceDetails/";
      let attendanceDetails = await axios.get(zohoURL + this.state.employeeId);
      if (attendanceDetails.data) {
        let { status, checkedInOrOut, checkedStatus, workingHours } = attendanceDetails.data;
        this.setState({
          status: status,
          checkedMessage: checkedInOrOut,
          checkStatus: checkedStatus,
          workingHours: workingHours,
          isLoading: false,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async checkInOrOut() {
    try {
      this.setState({ isLoading: true });
      let zohoURL = "http://intranet.accionlabs.com:3001/employee/attendance/";
      let check = this.state.checkStatus ? "checkOut" : "checkIn";
      let attendanceAPI = zohoURL + this.state.employeeId + "/" + check;
      let attendance = await axios.get(attendanceAPI);
      if (attendance.data.response === "success") {
        if (attendance.data.punchIn) {
          let formattedDate = attendance.data.punchIn.replace(/-/g, " ");
          formattedDate = moment(formattedDate).format("ddd, h:mm a");
          this.setState({
            tsecs: attendance.data.tsecs,
            checkStatus: true,
            checkedMessage: `Your last check-in was at ${formattedDate}`,
            isLoading: false,
          });
        } else {
          let formattedDate = attendance.data.tdate.replace(/-/g, " ");
          formattedDate = moment(formattedDate).format("ddd, h:mm a");
          this.setState({
            tsecs: attendance.data.tsecs,
            checkStatus: false,
            checkedMessage: `Your last check-out was at ${formattedDate}`,
            isLoading: false,
          });
        }
      } else {
        alert("Something went wrong");
        this.setState({ isLoading: false });
      }
    } catch (err) {}
  }

  login() {
    try {
      this.setState({ isLoading: true });
      chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (token) {
          let oAuthGoogle = await axios.get(
            "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
              token
          );
          if (oAuthGoogle.data.email.includes("@accionlabs.com")) {
            alert(oAuthGoogle.data.email);
            this.getUserDetails(oAuthGoogle.data.email);
          } else {
            alert("Login with Accion email id");
            this.logout();
          }
        } else {
          if (chrome.runtime.lastError) {
            console.log("Error");
          }
          alert("Login error!!!");
          this.setState({ isLoading: false });
        }
      });
    } catch (err) {
      if (chrome.runtime.lastError) {
        console.log("Error");
      }
      alert(err);
    }
  }

  logout() {
    try {
      chrome.identity.getAuthToken(async (current_token) => {
        if (current_token) {
          await axios.get(
            "https://accounts.google.com/o/oauth2/revoke?token=" + current_token
          );
          chrome.identity.removeCachedAuthToken(
            { token: current_token },
            () => {
              this.setState({
                isLogged: false,
                isLoading: false,
              });
            }
          );
          chrome.storage.sync.clear(() => {
            alert("Logged Out");
          });
        } else {
          chrome.storage.sync.clear(() => {});
          this.setState({
            isLogged: false,
          });
        }
      });
    } catch (err) {
      alert(err);
    }
  }

  componentDidMount() {
    chrome.storage.sync.get(
      ["email", "name", "photo", "employeeId", "isLogged"],
      (value) => {
        if (value.isLogged) {
          this.setState({
            email: value.email,
            name: value.name,
            photo: value.photo,
            employeeId: value.employeeId,
            isLogged: value.isLogged,
          });
          this.getAttendanceDetails();
        }
      }
    );
  }

  render() {
    const { activeIndex, checkStatus } = this.state;
    return (
      <div style={{ margin: "10px" }}>
        {this.state.isLogged ? (
          <Card fluid centered raised>
            <Card.Content textAlign="center">
              <Image
                floated="right"
                size="mini"
                circular
                src={this.state.photo}
              />
              <Card.Header style={{ marginTop: "15px" }}>
                {this.state.name}
              </Card.Header>
              <Card.Description style={{ marginTop: "15px" }}>
                {this.state.status}
              </Card.Description>
              <Card.Description>{this.state.checkedMessage}</Card.Description>
              <Card.Meta style={{ fontSize: "30px", marginTop: "12px" }}>
                {this.state.workingHours} hrs
              </Card.Meta>
              <Card.Description>
                {moment().format("D MMM yyyy (ddd)")}
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Segment textAlign="center" size="big">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AnimationIcon animate={this.state.checkStatus} />
                  <Button
                    onClick={this.checkInOrOut}
                    inverted
                    color={checkStatus ? "red" : "green"}
                    animated
                    icon
                    labelPosition="left"
                    loading={this.state.isLoading}
                  >
                    <Button.Content className="checkButton" visible>
                      {checkStatus ? "Check Out" : "Check In"}
                    </Button.Content>
                    <Button.Content
                      style={{
                        fontSize: "19px",
                        textAlign: "center",
                        padding: "3px 0 5px 0",
                      }}
                      hidden
                    >
                      <Timer />
                      <Icon
                        style={{ position: "relative", left: "10px" }}
                        name={checkStatus ? "left arrow" : "right arrow"}
                      />
                    </Button.Content>
                  </Button>
                </div>
              </Segment>
              <Accordion>
                <Accordion.Title
                  active={activeIndex === 0}
                  index={0}
                  onClick={this.accordianHandleClick}
                ></Accordion.Title>
                <Accordion.Content active={activeIndex === 0}>
                  <Button onClick={this.logout}>Log out</Button>
                </Accordion.Content>
              </Accordion>
            </Card.Content>
          </Card>
        ) : (
          <Card fluid centered raised>
            <Card.Content textAlign="center">
              <Button
                color="blue"
                onClick={this.login}
                loading={this.state.isLoading}
              >
                Sign in with Accion email
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>
    );
  }
}

function Timer() {
  const [time, timer] = React.useState("");
  React.useEffect(() => {
    const timeId = setInterval(() => {
      timer(moment().format("h:mm:ss a"));
    }, 1000);
    return () => {
      clearInterval(timeId);
    };
  }, []);
  return time;
}

function AnimationIcon(flag) {
  let animationController = React.createRef();
  React.useEffect(() => {
    let animationRender = lottie.loadAnimation({
      container: animationController.current,
      render: "svg",
      loop: flag.animate,
      path:
        "https://maxst.icons8.com/vue-static/landings/animated-icons/icons/hourglass/hourglass.json",
    });
    animationRender.setSpeed(0.5);
    return () => {
      animationRender.destroy();
    };
  });

  return (
    <div
      ref={animationController}
      className="animation-icon"
      style={{ width: "35px", height: "35px", marginRight: "10px" }}
    />
  );
}

export default Home;
