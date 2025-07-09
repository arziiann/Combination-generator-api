import express from "express";
import db from "../db/index.js";
import CombinationGenerator from "../logic/combinationGenerator.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.post("/", validateRequest, async (req, res) => {
    try {
        const { items, length } = req.body;
        const generator = new CombinationGenerator(items, length);
        const { items: rawItems, combinations } = generator.generate();
        const itemsAsString = rawItems.join(" ");
      
        const client = await db.connect();
      
        try {
          await client.query("BEGIN");
      
          const itemInsert = await client.query(
            "INSERT INTO items (content) VALUES ($1) RETURNING id",
            [itemsAsString]
          );
          const itemId = itemInsert.rows[0].id;
      
          await client.query(
            "INSERT INTO combinations (combination, item_id) VALUES ($1, $2)",
            [combinations, itemId]
          );
      
          const responseRes = await client.query(
            "INSERT INTO responses (result) VALUES ($1) RETURNING id",
            [JSON.stringify({ combination: combinations })]
          );
          const responseId = responseRes.rows[0].id;
      
          await client.query("COMMIT");
      
          res.status(200).json({
            id: responseId,
            combination: combinations,
          });
      
        } catch (err) {
          await client.query("ROLLBACK");
          console.error("DB error:", err);
          res.status(500).json({ error: "Database error" });
        } finally {
          client.release();
        }
      } catch (err) {
        console.error("Generator error:", err);
        res.status(500).json({ error: "Internal error" });
      }
      
});

export default router;
