import Product from "../models/Product.js";
import axios from "axios";

const seed = async () => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    console.log("Products seeding...", response.data);
    const products = response.data;
    // if already seeded, destroy first
    await destroy();
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newProduct = new Product({
        title: product.title,
        description: product.description,
        price: product.price,
        dateOfSale: product.dateOfSale,
        isSold: product.isSold,
        category: product.category,
      });
      await newProduct.save();
    }
    console.log("Products seeded successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

const destroy = async () => {
  try {
    await Product.deleteMany({});
    console.log("Products destroyed successfully!");
  } catch (error) {
    console.error("Error destroying products:", error);
  }
};

export { seed, destroy };
