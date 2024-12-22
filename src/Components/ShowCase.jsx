import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const ShowCase = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getShowCaseUsers();
  }, []);

  const getShowCaseUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getShowCase');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching showcase projects:', error);
    }
  };

  const navigateToShowcase = async (_id) => {
    try {
      console.log(_id);
      navigate('/showcase', { state: { code: _id } });
      console.log('Clicked');
    } catch (error) {
      console.error('Error navigating to showcase:', error);
      // Consider displaying an error message to the user here
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 flex flex-row'>
      <Sidebar />
      <div className='p-8 flex-1'>
        <h1 className='text-white text-4xl font-bold mb-8 border-b border-blue-500 pb-4'>
          Showcased Projects
        </h1>
        {projects.length === 0 ? ( // Check for empty projects
          <div className='text-white text-center'>
            <p>There are currently no projects showcased.</p>
            <p className='mt-4'>
              Browse projects in your dashboard and add them to your showcase!
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-800 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-4 text-blue-400 hover:text-blue-300">
                  {project.projectName}
                </h2>
                <div className="flex flex-col space-y-4">
                  <p className="text-gray-400 text-sm">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    onClick={() => navigateToShowcase(project._id)}
                  >
                    <span>View Project</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowCase;