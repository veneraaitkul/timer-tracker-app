import React, { useState, useContext } from "react";
import { useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { ADD_PROJECT } from "../graphql/mutations";
import Context from "../Context/Context";

function NewProject() {
  let history = useHistory();
  const context = useContext(Context);

  const [projectDescription, setProjectDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const [createProject] = useMutation(ADD_PROJECT);

  // it prevents unnecessary re-rendering
  let timer;
  let debounce = function (func, delay) {
    // cancels the setTimeout method execution
    clearTimeout(timer);

    // executes the func after delay time.
    timer = setTimeout(func, delay);
  };

  // set description
  const handleDescriptionChange = (e) => {
    e.persist();
    debounce(() => {
      setProjectDescription(e.target.value);
    }, 500);
  };

  // set name
  const handleNameChange = (e) => {
    e.persist();
    debounce(() => {
      setProjectName(e.target.value);
    }, 500);
  };

  // submit data to database
  const submitProject = () => {
    if (!projectName && !projectDescription) {
      setError(true);
      setMessage("Please make sure to fill all required fields.");
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 3000);
    } else {
      createProject({
        variables: {
          project_name: projectName,
          project_description: projectDescription,
          project_date_created: new Date(),
          project_is_active: 1,
        },
      })
        .then((response) => {
          const newProject = response.data.createProject[0];
          const projects = [...context.availableProjects];
          projects.push(newProject);
          context.actions.setAvailableProjects(projects);
          setMessage(`Project "${projectName}" was created successfully!`);
          setTimeout(() => {
            setMessage("");
            setProjectDescription("");
            setProjectName("");
          }, 3000);
        })
        .catch((err) => {return console.log(err)});
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-card" onClick={(e) => {return e.stopPropagation()}}>
        <header className="modal-card-head">
          <p className="modal-card-title">New project</p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => {return history.goBack()}}
          ></button>
        </header>

        <section className="modal-card-body">
          <div className="field">
            <label className="label is-small">Name</label>
            <div className="control">
              <input
                className={
                  error ? "input is-small is-danger" : "input is-small"
                }
                type="text"
                placeholder="Project name..."
                maxLength="100"
                onChange={handleNameChange}
              />
            </div>
          </div>

          <div className="field">
            <label className="label  is-small">Description</label>
            <div className="control">
              <textarea
                className={
                  error ? "textarea is-small is-danger" : "textarea is-small"
                }
                placeholder="Project description..."
                maxLength="300"
                onChange={handleDescriptionChange}
              ></textarea>
            </div>
          </div>
        </section>

        <footer className="modal-card-foot">
          <p className="help is-danger mr-3">{message}</p>
          <button className="button is-success" onClick={() => {return submitProject()}}>
            <span>Save</span>
            <span className="icon is-small">
              <span className="material-icons is-size-5">save</span>
            </span>
          </button>
          <button className="button" onClick={() => {return history.goBack()}}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default NewProject;
