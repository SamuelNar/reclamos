import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'mysqlspring.cve2cg4quyaq.sa-east-1.rds.amazonaws.com',
  user: 'lidercom',
  password: '123lidercom456',
  database: 'control',
});

app.get('/reclamos', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM reclamos');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reclamos:', error);
    res.status(500).json({ error: 'Error fetching reclamos' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});