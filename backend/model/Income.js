const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class IncomeModel {
  static async getAll() {
    return await prisma.income.findMany();
  }

  static async create(data) {
    return await prisma.income.create({ data });
  }

  static async update(id, data) {
    return await prisma.income.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return await prisma.income.delete({
      where: { id },
    });
  }
}

module.exports = IncomeModel;
