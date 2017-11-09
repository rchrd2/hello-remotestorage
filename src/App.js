import React, { Component } from 'react';
import RemoteStorage from 'remotestoragejs';

const remoteStorage = new RemoteStorage({logging: true});

const dataPath = 'hello-remote-storage-data';

class App extends Component {
  constructor(props) {
    super(props);

    this.fileChoices = [
      'hello.txt',
      'world.txt',
      'lorem.txt',
    ]

    this.state = {
      listing: null,
      all: null,
      fileContents: '',
      fileName: this.fileChoices[0],
    };

    // For debugging, create easy to access reference
    window.remoteStorage = remoteStorage;

    remoteStorage.access.claim(dataPath, 'rw');
    remoteStorage.caching.enable('/' + dataPath + '/')

    this.client = remoteStorage.scope('/' + dataPath + '/');

    // For demo puproses, console.log all data
    // Get all items in the dataPath category/folder
    this.client.getAll('').then(objects => {
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

  connect() {
    var account = prompt('What is your account (eg name@example.com)?');
    remoteStorage.connect(account)
  }

  loadFile(fileName) {
    this.client.getFile(fileName).then(file => {
      console.log(file);
      let contents = file.data ? file.data : '';
      this.setState({fileContents: contents});
    });
  }

  saveFile(fileName, data) {
    this.client.storeFile('text/plain', fileName, data).then(() => {
      console.log("data has been saved");
      this.getListing();
    });
  }

  getListing() {
    this.client.getListing('').then(listing => {
      this.setState({'listing': listing});
      console.log(listing)
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-intro">
          <div>
            <p><b>RemoteStorageJS Examle App</b></p>
            <p>By default data is stored in Indexed DB, but a RemoteStorage backend can be also be added.</p>
          </div>
          <div>
            <p>Click here to connect to a RemoteStorage backend such as <a href="https://5apps.com">5apps.com</a>
            <br/>
            <button onClick={this.connect}>Connect</button>
            </p>

          </div>
          <div>
            <label>File:
              <select name="select" value={this.state.fileName} onChange={this.handleSelectChange}>
                {this.fileChoices.map((name, i) => {
                  return <option value={name} key={i}>{name}</option>;
                })}
              </select>
            </label>
            <br/>
            <textarea rel="user-input" onChange={this.handleInputChange} value={this.state.fileContents}></textarea>
          </div>
          <div>Listing output:
            <pre>{JSON.stringify(this.state.listing, null, 2)}</pre>
            <br/>
          </div>

        </div>
      </div>
    );
  }
}

export default App;
