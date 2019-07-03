import React, { Component } from "react";
import { HamburgerArrowTurn } from "react-animated-burgers";
import "./index.css";
import Scene from "./Scene";
import Popup from "./Popup";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { showDetails: false };
  }
  togglePopup = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };
  render() {
    return (
      <div className="wrapper">
        <HamburgerArrowTurn
          className="hamburger-button"
          isActive={this.state.showDetails}
          toggleButton={this.togglePopup}
          barColor="white"
        />
        <Scene />
        {this.state.showDetails ? (
          <Popup />
        ) : (
          <>
            <h1 className="title text-center">Lorem ipsum</h1>
            <div className="credits">
              By{" "}
              <a href="https://github.com/Rollo98">
                <strong>Roland Paiusan</strong>
              </a>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default App;
