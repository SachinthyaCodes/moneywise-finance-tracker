const pool = require("../database");

const getIncomeRecords = async (req, res) => {
    try {
        // First, let's check what tables are available
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('Available tables:', tablesResult.rows);
        
        // Then try to query the Income table
        const result = await pool.query(`
            SELECT * 
            FROM "Income" 
            ORDER BY date DESC 
            LIMIT 5
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching income records:", error);
        res.status(500).json({ 
            error: "Failed to fetch income records",
            details: error.message,
            tables: tablesResult?.rows || []
        });
    }
};

const getIncomeById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT * 
            FROM "Income" 
            WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Income record not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching income record:", error);
        res.status(500).json({ 
            error: "Failed to fetch income record",
            details: error.message
        });
    }
};

module.exports = { getIncomeRecords, getIncomeById }; 