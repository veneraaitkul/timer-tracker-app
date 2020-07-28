import React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import ContextProvider from './Context/ContextProvider';
import Projects from './components/Projects';
import ProjectDetails from './components/ProjectDetails';
import NewProject from './components/NewProject';
import UpdateProject from './components/UpdateProject';
import './App.scss';

const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql',
  cache: new InMemoryCache(),
});

const Navigation = () => {
  return (
    <nav className="level is-mobile mb-6">
      <div className="level-left">
        <p className="level-item title is-4">Projects</p>
      </div>

      <div className="level-right">
        <div className="level-item">
          <Link to={`/new`} className="button is-primary">
            <span>New Project</span>
            <span className="icon is-small">
              <span className="material-icons">add</span>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <ContextProvider>
        <Router basename="/">
          <div className="container px-5 py-5">
            <Navigation />

            <Route path="/" component={Projects}></Route>
            <Route path="/new" component={NewProject}></Route>
            <Route path="/edit/:id" component={UpdateProject}></Route>
            <Route path="/projects/:id" component={ProjectDetails}></Route>
          </div>
        </Router>
      </ContextProvider>
    </ApolloProvider>
  );
}

export default App;
