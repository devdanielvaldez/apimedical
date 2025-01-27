
const {
    GoogleGenerativeAI,
  } = require('@google/generative-ai');
const {
    GoogleAIFileManager,
  } = require('@google/generative-ai/server');
  const router = require("express").Router();
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
const { PROCESS_ID, PROCESS_INSURANCE } = require('../prompts');
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  
  async function uploadToGemini(fileBuffer, mimeType) {
  // Define la ruta del directorio temporal
  const tempDir = path.join(__dirname, 'temp');

  // Crea el directorio temporal si no existe
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Crea un archivo temporal
  const tempFilePath = path.join(tempDir, `id_${Date.now()}.jpeg`);
  
  // Escribe el buffer en el archivo temporal
  fs.writeFileSync(tempFilePath, fileBuffer);

  const uploadResult = await fileManager.uploadFile(tempFilePath, {
    mimeType: "image/jpeg",
    displayName: path.basename(tempFilePath),
  });
  
  // Elimina el archivo temporal después de subirlo
  fs.unlinkSync(tempFilePath);

  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
  }

  async function processId(req, res) {
    if (!req.file) {
      return res.status(400).send('No se ha subido ninguna imagen.');
    }
  
    try {
      const mimeType = req.file.mimetype;
      console.log(mimeType)
      const fileBuffer = req.file.buffer;
  
      const uploadedFile = await uploadToGemini(fileBuffer, mimeType);
  
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });
  
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      };
  
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: 'user',
            parts: [
              {
                fileData: {
                  mimeType: uploadedFile.mimeType,
                  fileUri: uploadedFile.uri,
                },
              },
              {
                text: req.body.type == 'C' ? PROCESS_ID : PROCESS_INSURANCE,
              },
            ],
          },
        ],
      });
  
      const result = await chatSession.sendMessage(req.body.type == 'C' ? PROCESS_ID : PROCESS_INSURANCE);
      console.log(result.response.text());
      res.status(200).json({
        ok: true,
        data: result.response.text()
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al procesar la imagen.');
    }
  }
  
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  router.post('/', upload.single('identification'), processId);

  module.exports = router;
  