import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  formattedCode: {
    type: String,
    required: true,
  },
  messages: [
    {
      sender: { type: String, required: true },  // user or bot
      text: { type: String, required: true },    // The message text
    }
  ],
  showcase:{
    type:Boolean,
    required:true

  },
  deleted:{
    type:Boolean,
    required:true,
    default:false

  }
}, { timestamps: true });

const Code = mongoose.model('Code', codeSchema);

export default Code; // Export the model as the default export
