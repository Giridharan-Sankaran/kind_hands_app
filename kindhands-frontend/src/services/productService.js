// src/services/productService.js
import { apiRequest } from "./api";

export async function listCategories() {
  const data = await apiRequest("/categories");
  return data.categories;
}

export async function listProducts({ category, search, frequentlyOrdered, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (frequentlyOrdered) params.set("frequentlyOrdered", "true");
  params.set("page", page);

  const data = await apiRequest(`/products?${params.toString()}`);
  return data;
}
