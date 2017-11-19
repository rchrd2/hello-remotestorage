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
      connected: remoteStorage.connected
    };

    // For debugging, create easy to access reference
    window.remoteStorage = remoteStorage;
    remoteStorage.access.claim(dataPath, 'rw');
    remoteStorage.caching.enable('/' + dataPath + '/')
    this.client = remoteStorage.scope('/' + dataPath + '/');

    ((handler) => {
      remoteStorage.on('connected', handler);
      remoteStorage.on('disconnected', handler);
    })(() => {
      this.setState({connected: remoteStorage.connected})
    })

    this.getListing();
    this.loadFile(this.state.fileName);

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleUploadFormSubmit = this.handleUploadFormSubmit.bind(this);
  }

  handleInputChange(e) {
    this.setState({fileContents: e.target.value});
    this.saveFile(this.state.fileName, e.target.value);
  }

  handleSelectChange(e) {
    this.setState({fileName: e.target.value});
    this.loadFile(e.target.value);
  }

  handleUploadFormSubmit(e) {
    e.preventDefault();
    var input = this.refs.fileField;
    var file = input.files[0];
    var fileReader = new FileReader();

    fileReader.onload = () => {
      this.client.storeFile(file.type, file.name, fileReader.result).then(() => {
        console.log("Upload done")
        this.getListing();
        input.value = null;
      });
    };

    fileReader.readAsArrayBuffer(file);
  }

  connect() {
    var account = prompt('What is your account (eg name@example.com)?');
    if (account)
      remoteStorage.connect(account);
  }

  disconnect() {
    remoteStorage.disconnect();
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
            {remoteStorage.connected === false ?
              <button onClick={this.connect}>Connect</button>
              : <button onClick={this.disconnect}>Disconnect</button>}
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
          <div>
            <div>
              <p>File Upload:</p>
              <p>This shows how to upload files using remote storage.</p>
            </div>
            <form onSubmit={this.handleUploadFormSubmit}>
              <input type="file" ref="fileField"/>
              <input type="submit" />
            </form>
          </div>

        </div>
      </div>
    );
  }
}

export default App;
