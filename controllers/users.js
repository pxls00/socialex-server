const Users = require("../models/Users");

class userController {
  async getUsers(req, res) {
    try {
      const { query } = req;
      const { skip, limit } = query;
      delete query.skip;
      delete query.limit;
      const q =
        "search" in query
          ? { name: new RegExp(query.search, "i") }
          : query;
      res.set('x-total-count', await Users.count())
      const result  = await Users.find(q).sort({createdData: -1}).skip(+skip).limit(+limit).exec()
      const count = await Users.find(q).count()
      const next = (count - result.length) > +skip
      return res.json({
        data: result,
        count,
        next
      });

    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId);
      const userWithoutToken = JSON.parse(JSON.stringify(user))
      delete userWithoutToken.token
      res.json(userWithoutToken);
    } catch (error) {
      return res.json({ message: error });
    }
  }
}

module.exports = new userController();
