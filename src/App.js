import React, { Component } from 'react';
import './App.css';

import RemoteStorage from 'remotestoragejs';


const remoteStorage = new RemoteStorage({logging: true});

class App extends Component {
  constructor(props) {
    super(props);

    this.fileChoices = [
      'hello.txt',
      'world.txt',
      'lorum.txt',
    ]

    this.state = {
      listing: null,
      all: null,
      fileContents: '',
      fileName: this.fileChoices[0],
    };

    remoteStorage.access.claim('*', 'rw');
    remoteStorage.caching.enable('/')


    let client = this.client = remoteStorage.scope('/');


    // For demo puproses, console.log all data
    // Get all items in the "/" category/folder
    client.getAll('').then(objects => {
      this.setState({'all': objects});
      console.log(objects)
    });


    this.getListing();
    this.loadFile(this.state.fileName);

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({fileContents: e.target.value});
    this.saveFile(this.state.fileName, e.target.value);
  }

  handleSelectChange(e) {
    this.setState({fileName: e.target.value});
    this.loadFile(e.target.value);
  }

  loadFile(fileName) {
    this.client.getFile(fileName).then(file => {
      console.log(file);
      let contents = file.data ? file.data : '';
      this.setState({fileContents: contents});
    });
  }

  saveFile(fileName, data) {
    // Update storage
    this.client.storeFile('text/plain', fileName, data).then(() => {
      console.log("data has been saved");
      this.getListing();
    });
  }

  getListing() {
    // List all items in the "/" category/folder
    this.client.getListing('').then(listing => {
      this.setState({'listing': listing});
      console.log(listing)
    });
  }

  render() {
    return (
      <div className="App">
        <p><b>This example stores using indexed db</b></p>
        <div className="App-intro">
          <div>
            <label>File:
              <select name="select" value={this.state.fileName} onChange={this.handleSelectChange}>
                {this.fileChoices.map((name, i) => {
                  return <option value={name} key={i}>{name}</option>;
                })}
              </select>
            </label>
          </div>
          <textarea rel="user-input" onChange={this.handleInputChange} value={this.state.fileContents}></textarea>
          <pre>{JSON.stringify(this.state.listing, null, 2)}</pre>

        </div>
      </div>
    );
  }
}

export default App;
