import React, { Component } from 'react';
import Context from './Context';

export default class ContextProvider extends Component {
  state = {
    availableProjects: [],
    selectedProject: {},
    projectTimeLogs: [],
    notification: '',
  };

  actions = {
    setAvailableProjects: (projects) => {
      return this.setState({ availableProjects: projects });
    },
    setSelectedProject: (project) => {
      return this.setState({ selectedProject: project });
    },
    setProjectTimeLogs: (logs) => {
      return this.setState({ projectTimeLogs: logs });
    },
    setNotification: (message) => {
      return this.setState({ notification: message });
    },
  };

  render() {
    const context = { ...this.state, actions: this.actions };
    return <Context.Provider value={context}>{this.props.children}</Context.Provider>;
  }
}
