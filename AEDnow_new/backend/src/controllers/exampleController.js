// Example controller
const exampleController = {
  // GET all items
  getAll: async (req, res) => {
    try {
      res.status(200).json({ message: 'Get all items' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET single item by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      res.status(200).json({ message: `Get item with id: ${id}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create new item
  create: async (req, res) => {
    try {
      const data = req.body;
      res.status(201).json({ message: 'Item created', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT update item
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      res.status(200).json({ message: `Item ${id} updated`, data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE item
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      res.status(200).json({ message: `Item ${id} deleted` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = exampleController;
