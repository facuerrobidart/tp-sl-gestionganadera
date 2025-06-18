import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { latitude, longitude, radius } = req.body;

    // Validar parámetros
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof radius !== 'number' ||
      radius <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren coordenadas válidas y un radio positivo'
      });
    }

    // Convertir radio de km a metros para la consulta
    const radiusInMeters = radius * 1000;

    // Conectar a MongoDB
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB || 'gestionganadera');
    const collection = db.collection('cattle');

    // Realizar búsqueda geoespacial
    const results = await collection.find({
      position: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude] // MongoDB usa [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error en búsqueda geoespacial:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al realizar la búsqueda geoespacial'
    });
  }
}