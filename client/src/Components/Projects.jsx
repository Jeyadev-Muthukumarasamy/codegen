import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Initial load of projects
  useEffect(() => {
    loadProjects();
  }, []);

  // Separate function to load projects
  const loadProjects = async () => {
    try {
      const email = sessionStorage.getItem('sessionToken');
      if (!email) {
        setError("No email found in session storage");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/sendCode?email=${email}`);
      
      if (response.data.response) {
        setProjects(response.data.response);
      } else {
        setError("No projects found. Start creating some!");
      }
    } catch (err) {
      setError("An error occurred while fetching projects. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to project details
  const handleProjectClick = (id) => {
    navigate(`/showproject/${id}`);
  };

  // Handle showcase button click
  const handleShowcaseClick = async (projectId, e) => {
    e.stopPropagation();  // Prevent project click event
    
    try {
      // Update local state immediately (optimistic update)
      setProjects(currentProjects => 
        currentProjects.map(project => 
          project._id === projectId 
            ? { ...project, showcase: true }
            : project
        )
      );

      // Make API call
      await axios.put('http://localhost:3001/api/setShowCase', { _id: projectId });
      
    } catch (error) {
      // Revert changes if API call fails
      setProjects(currentProjects => 
        currentProjects.map(project => 
          project._id === projectId 
            ? { ...project, showcase: false }
            : project
        )
      );
      console.error('Failed to update showcase:', error);
    }
  };

  const handleDelete = async (_id) => {
    try {
      // Make DELETE API call
      const response = await axios.delete("http://localhost:3001/api/deleteProject", { data: { _id } });
      console.log("Delete response:", response.data);

      // Optimistic delete - update the UI immediately by setting the deleted status
      setProjects(prevProjects => prevProjects.map(project => 
        project._id === _id ? { ...project, deleted: true } : project
      ));
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project. Please try again.");
    }
  };

  // Project card component
  const ProjectCard = ({ project }) => (
    <div className={`bg-gray-800 p-6 rounded hover:bg-gray-700 transition duration-200 ${project.deleted ? 'opacity-50' : ''}`}>
      <div 
        onClick={() => handleProjectClick(project._id)} 
        className="cursor-pointer"
      >
        <h3 className="text-white font-semibold">
          {project.projectName}
        </h3>
        <div className="text-gray-500 text-sm">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>

      {!project.showcase && !project.deleted ? (
        <button
          onClick={(e) => handleShowcaseClick(project._id, e)}
          className="mt-4 w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
        >
          Add to Showcase
        </button>
        
      ) : (
        project.deleted ? (
          <p className="mt-4 text-red-500">Deleted</p>  // Display deleted message
        ) : (
          <p className="mt-4 text-green-500">Added to Showcase</p> 
        )
      )}

      {/* Delete Button */}
      {!project.deleted && (
        <button
          onClick={(e) => handleDelete(project._id)}
          className="mt-4 w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition duration-200"
        >
          Delete
        </button>
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          <span className="ml-3 text-white">Loading your projects...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col justify-center items-center">
          <p className="text-red-500 text-lg">{error}</p>
          <p className="text-white mt-4">
            {error.includes("No projects found") 
              ? "Start by creating a new project!" 
              : "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl text-white mb-6">Your Projects</h1>
        
        {projects.length === 0 ? (
          <div className="text-white text-lg flex flex-col items-center justify-center h-full">
            <p>No projects found. Ready to start your coding journey?</p>
            <p className="mt-4">Click "New Project" in the sidebar to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
