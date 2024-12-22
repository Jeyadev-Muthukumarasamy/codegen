import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const email = sessionStorage.getItem('sessionToken');
        const response = await axios.get(`http://localhost:3001/api/sendCode?email=${email}`);

        if (response.data.response) {
          setProjects(response.data.response);
        } else {
          setError('No projects found. Start creating some!'); // More encouraging message
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError('An error occurred while fetching projects. Please check your network connection or try again later.'); // More user-friendly error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (id) => {
    navigate('/showproject', { state: { id } });
  };

  const handleShowcaseClick = async (_id) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/changeshow`, { _id });
      console.log(response);

      // Update the project state to reflect the updated showcase status
      setProjects(prevProjects =>
        prevProjects.map(project => (project._id === _id ? { ...project, showcase: true } : project))
      );
    } catch (error) {
      console.error(error);
      setError("Failed to update showcase status. Please try again."); // Error message for showcase update
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl text-white mb-6">Your Projects</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white">Loading your projects...</span> {/* Loading text */}
          </div>
        ) : error ? (
          <div className="text-red-500 text-lg flex flex-col items-center justify-center h-full">
            {error}
            <p className='text-white mt-4'>It looks like you don't have any projects yet. Start by creating a new project!</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-white text-lg flex flex-col items-center justify-center h-full">
            <p>No projects found. Ready to start your coding journey?</p>
            <p className="mt-4">Click "New Project" in the sidebar to begin.</p> {/* Instruction text */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Added lg:grid-cols-3 for larger screens */}
            {projects.map((project) => (
              <div key={project._id} className="bg-gray-800 p-6 rounded hover:bg-gray-700 transition duration-200"> {/* Added hover effect */}
                <div onClick={() => handleProjectClick(project._id)} className="cursor-pointer">
                  <h3 className="text-white font-semibold">{project.projectName}</h3> {/* Made project name bold */}
                  <div className="text-gray-500 text-sm"> {/* Slightly darker date */}
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {!project.showcase && (
                  <button
                    className="mt-4 w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200" // Improved button styling
                    onClick={() => handleShowcaseClick(project._id)}
                  >
                    Add to Showcase
                  </button>
                )}
                {project.showcase && ( // Display "Added to Showcase" message
                  <p className="mt-4 text-green-500">Added to Showcase</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;