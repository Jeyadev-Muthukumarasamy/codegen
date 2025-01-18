  import Code from "../models/Codemodel.js";

  // Post a new code entry along with the initial message
  export const postCode = async (req, res) => {
      console.log("entered");

      try {
          const { projectName, email, formattedCode, messages,showcase } = req.body;  // Get messages array
            // Ensure messages is passed as an array
          

          // Validate required fields
          if (!projectName || !email || !formattedCode || !messages) {
              return res.status(400).json({ error: 'Missing required fields' });
          }

          // Creating a new code document with the messages array
          const code = new Code({
              projectName,
              email,
              formattedCode,
              messages,
              showcase  // Use the entire messages array directly
          });

          // console.log(code.messages, "hi");  

          // Save the document
          await code.save();
          console.log("reached this line")

          // Send success response
          res.status(200).json({
              message: "Code saved successfully",
              projectName,
              savedAt: code.createdAt,
          });
          console.log("saved")

      } catch (error) {
          // Log and handle errors
          console.error("Error in postCode:", error);
          res.status(500).json({ error: 'An error occurred' });
      }
  };

  export const sendCode = async (req, res) => {
    console.log("sendCode API called");

    const email = req.query.email;
    try {
      if (!email) {
        return res.status(400).json({ error: "Email parameter is missing" });
      }

      console.log("Searching for codes with email:", email);
      const response = await Code.find({ email: email });

      if (!response || response.length === 0) {
        return res.status(404).json({ error: "No code found for this email" });
      }

      // console.log("Found response:", response);
      res.status(200).json({ response: response });
    } catch (error) {
      console.error("Error in sendCode:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  };


  

  // Retrieve code entry by its ID
  export const sendCodeById = async (req, res) => {
      try {
          const id = req.query.id;
          console.log(id, "hi");
          const response = await Code.findById(id);
          if (!response) {
              return res.status(400).json({ error: "No code found for this ID" });
          }
          console.log(response);
          res.status(200).json({ response: response });
      } catch (error) {
          console.log(error);
          return res.status(500).json({ error: "An error occurred" });
      }
  };

  // Update code and add a new message from the AI (or update the code)
  export const updatedCode = async (req, res) => {
      try {
        console.log("reached here")
    
        const _id = req.body._id; 

        const messages = req.body.messages; 
        // console.log(_id,messages)
    
        if (!_id) {
          return res.status(400).json({ error: 'Missing _id' });
        }
    
        if (!messages) {
          return res.status(400).json({ error: 'Missing messages' });
        }
    
        const updatedCode = await Code.findByIdAndUpdate(
          _id,
          { 
            messages
          },
          { new: true }
        );
        console.log("reached here")
        if (!updatedCode) {
          return res.status(404).json({ error: "Code not found" });
        }
    
        res.status(200).json({
          message: "Code and message updated successfully",
          code: updatedCode,
        });
        // ... rest of your code ...
    
      } catch (error) {
        console.error("Error in updatedCode:", error);
        res.status(500).json({ error: 'An internal server error occurred' }); 
      }
    };

    export const  setShowCaseToTrue = async(req,res)=>{
      console.log("reached here")
      const { _id } = req.body; // Ensure you're extracting the ID from the request body
      try {
        if (!_id) {
          return res.status(400).json({ error: "Project ID is required" });
        }
    
        const updatedProject = await Code .findByIdAndUpdate(
          _id,
          { showcase: true }, // Update the `showcase` field
          { new: true } // Return the updated document
        );
    
        if (!updatedProject) {
          return res.status(404).json({ error: "Project not found" });
        }
    
        res.status(200).json({ message: "Project updated successfully", project: updatedProject });
      } catch (error) {
        console.error("Error updating showcase status:", error);
        res.status(500).json({ error: "An error occurred while updating the project" });
      }
    }

    export const deleteProject = async(req,res)=>{
      const { _id } = req.body;
      console.log("entered")
  if (!_id) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  try {
    const deletedProject = await Code.findByIdAndDelete(_id);

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "An error occurred while deleting the project" });
  }
    }
    export const updateCode = async (req, res) => {
      try {
        console.log("hi")
        const  id  = req.query.id;
        console.log(id)
        const { formattedCode, messages } = req.body; 

    
        // Validate input (e.g., check if required fields are present)
        if (!formattedCode || !messages) {
          return res.status(400).json({ message: 'FormattedCode and messages are required' });
        }
    
        // Find the code document
        const _id = id;
        const code = await Code.findById(_id);
        console.log("reached here")
        
        if (!code) {
          return res.status(404).json({ message: 'Code not found' });
        }
    
        // Update the code document
        code.formattedCode = formattedCode;
        code.messages = messages; 
        await code.save();

    
        return res.json({ message: 'Code and messages updated successfully' });
    
      } catch (error) {
        console.error('Error updating code:', error);
        res.status(500).json({ message: 'Failed to update code', error: error.message });
      }
    };
    