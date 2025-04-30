const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ExpenseModel {
  static async getAll() {
    return await prisma.expense.findMany();
  }

  static async create(data) {
    return await prisma.expense.create({ data });
  }

  static async update(id, data) {
    return await prisma.expense.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  static async delete(id) {
    return await prisma.expense.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = ExpenseModel;
