import React, { useState, useEffect, useRef, useContext } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useHistory } from "react-router-dom";
import { GET_PROJECT_QUERY } from "../graphql/queries";
import { UPDATE_PROJECT } from "../graphql/mutations";
import Context from "../Context/Context";

function UpdateProject() {
  let history = useHistory();
  const context = useContext(Context);
  const isMountedRef = useRef(null);

  // get project ID from url
  let { id } = useParams();
  id = parseInt(id);

  const [projectDescription, setProjectDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectIsActive, setProjectIsActive] = useState(1);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [updateProject] = useMutation(UPDATE_PROJECT);

  // access query
  const { loading, error, data } = useQuery(GET_PROJECT_QUERY, {
    variables: { id },
  });

  useEffect(() => {
    isMountedRef.current = false;

    if (!isMountedRef.current) {
      if (data) {
        setProjectName(data.project.project_name);
        setProjectDescription(data.project.project_description);
        setProjectIsActive(data.project.project_is_active === 1 ? true : false);
      }
    } else if (error) {
      return console.log(`Error! ${error.message}`);
    }

    return () => {return (isMountedRef.current = true)};
  }, [data, error, isMountedRef]);
  // set description
  const handleDescriptionChange = (e) => {
    setProjectDescription(e.target.value);
  };

  // set name
  const handleNameChange = (e) => {
    setProjectName(e.target.value);
  };

  // set if active
  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.name === "isActive" ? target.checked : target.value;

    setProjectIsActive(value);
  };

  // submit updated data to database
  const submitProject = async () => {
    if (!projectName && !projectDescription) {
      setIsError(true);
      setMessage("Please make sure to fill all required fields.");
      setTimeout(() => {
        setIsError(false);
        setMessage("");
      }, 3000);
    } else {
      const newProject = {
        id,
        project_name: projectName,
        project_description: projectDescription,
        project_is_active: projectIsActive ? 1 : 0,
      };
      updateProject({
        variables: newProject,
      })
        .then((response) => {
          let projects = [...context.availableProjects];
          projects = projects.map((project) => {
            return project.id === newProject.id ? newProject : project;
          });
          context.actions.setAvailableProjects(projects);

          setMessage(`Project "${projectName}" was updated!`);
          setTimeout(() => {
            setMessage("");
          }, 3000);
        })
        .catch((err) => {
          return console.log(err);
        });
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div
        className="modal-card"
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <header className="modal-card-head">
          <p className="modal-card-title">Edit project</p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => {
              return history.goBack();
            }}
          ></button>
        </header>

        <section className="modal-card-body">
          {loading ? (
            <span className="loader"></span>
          ) : (
            <>
              <div className="field">
                <label className="label is-small">Name</label>
                <div className="control">
                  <input
                    className={
                      isError ? "input is-danger is-small" : "input  is-small"
                    }
                    type="text"
                    placeholder="Project name..."
                    value={projectName}
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
                      isError
                        ? "textarea is-danger is-small"
                        : "textarea  is-small"
                    }
                    placeholder="Project description..."
                    value={projectDescription}
                    maxLength="300"
                    onChange={handleDescriptionChange}
                  ></textarea>
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="checkbox mr-2"
                      checked={projectIsActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="modal-card-foot">
          <p
            className={isError ? "help is-danger mr-3" : "help is-success mr-3"}
          >
            {message}
          </p>
          <button
            className="button is-success"
            onClick={() => {
              return submitProject();
            }}
          >
            <span>Save</span>
            <span className="icon is-small">
              <span className="material-icons is-size-5">save</span>
            </span>
          </button>
          <button
            className="button"
            onClick={() => {
              return history.goBack();
            }}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default UpdateProject;
