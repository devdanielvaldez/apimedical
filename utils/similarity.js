const Appointment = require('../models/appointment');
const { generateEmbedding } = require("./embeddings");

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
    return dotProduct / (normA * normB);
}

async function searchAppointment(query) {
    const queryEmbedding = await generateEmbedding(query);

    const appointments = await Appointment.find({});
    const results = appointments.map((appointment) => {
        const similarity = cosineSimilarity(queryEmbedding, appointment.embedding);
        return { appointment, similarity };
    });

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
}

// async function searchFixes(query) {
//     const queryEmbedding = await generateEmbedding(query);

//     const fixes = await Fix.find({});
//     const results = fixes.map((fix) => {
//         const similarity = cosineSimilarity(queryEmbedding, fix.embedding);
//         return { fix, similarity };
//     });

//     return results.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
// }

module.exports = { searchAppointment};
