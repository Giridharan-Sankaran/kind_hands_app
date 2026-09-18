// src/pages/ProductCatalog.jsx
import React, { useEffect, useState } from "react";
import { Search, Plus, Check, Package } from "lucide-react";
import { listCategories, listProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import { useCart } from "../context/CartContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function formatPrice(n) {
  return `₹${n.toFixed(0)}`;
}

export default function ProductCatalog({ role }) {
  const { setCountFromCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    listCategories().then(setCategories).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const timeout = setTimeout(() => {
      listProducts({ category: activeCategory, search, page: 1 })
        .then((data) => {
          if (cancelled) return;
          setProducts(data.products);
          setPagination(data.pagination);
        })
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [activeCategory, search]);

  const loadPage = async (page) => {
    setLoading(true);
    try {
      const data = await listProducts({ category: activeCategory, search, page });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const cart = await addToCart(productId, 1);
      setCountFromCart(cart);
      setAddedProductId(productId);
      setTimeout(() => setAddedProductId((current) => (current === productId ? null : current)), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (role !== "elder") {
    return <p className="max-w-2xl mx-auto mt-10 text-center text-ink-muted">Only elders can browse the shop.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-2">
      <h1 className="font-display text-2xl font-bold text-ink">Shop</h1>

      <div className="mt-4 relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          placeholder="Search for an item, e.g. rice, milk, soap"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-surface pl-10 pr-4 py-3 text-base text-ink outline outline-1 outline-line focus:outline-2 focus:outline-pine"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory("")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeCategory === "" ? "bg-pine text-white" : "bg-surface text-ink-muted outline outline-1 outline-line hover:bg-paper"}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeCategory === c.id ? "bg-pine text-white" : "bg-surface text-ink-muted outline outline-1 outline-line hover:bg-paper"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10 text-center">
          <Package className="mx-auto text-ink-muted" size={28} />
          <p className="mt-2 text-ink-muted">No items found. Try a different search.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{p.category?.name}</div>
                <div className="mt-1 font-semibold text-ink text-lg">{p.name}</div>
                <div className="text-ink-muted text-sm">{p.unit}</div>
                <div className="mt-2 text-lg font-bold text-ink">{formatPrice(p.price)}</div>
              </div>
              <Button
                onClick={() => handleAddToCart(p.id)}
                variant={addedProductId === p.id ? "accent" : "primary"}
                size="lg"
                className="mt-4 w-full"
              >
                {addedProductId === p.id ? <Check size={18} /> : <Plus size={18} />}
                {addedProductId === p.id ? "Added" : "Add to cart"}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="secondary" disabled={pagination.page <= 1} onClick={() => loadPage(pagination.page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-ink-muted">Page {pagination.page} of {pagination.pages}</span>
          <Button variant="secondary" disabled={pagination.page >= pagination.pages} onClick={() => loadPage(pagination.page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
