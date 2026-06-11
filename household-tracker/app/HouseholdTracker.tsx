"use client";

import React, { useState, useEffect } from "react";

interface Purchase {
  id: string;
  datePurchased: string;
  dateEnded: string | null;
  price: number;
  quantity?: number;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  purchases: Purchase[];
}

// Функція для завантаження з localStorage
const loadProductsFromStorage = (): Product[] => {
  try {
    const saved = localStorage.getItem("householdProducts");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load products from storage:", error);
  }
  return [];
};

const HouseholdTracker: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(loadProductsFromStorage);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "шампунь",
  });
  const [newPurchase, setNewPurchase] = useState<{
    productId: string;
    datePurchased: string;
    dateEnded: string;
    price: number;
    quantity: number;
    notes: string;
  }>({
    productId: "",
    datePurchased: "",
    dateEnded: "",
    price: 0,
    quantity: 1,
    notes: "",
  });

  // Збереження в localStorage (тільки коли products змінюється)
  useEffect(() => {
    localStorage.setItem("householdProducts", JSON.stringify(products));
  }, [products]);

  const addProduct = () => {
    if (!newProduct.name.trim()) return;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      purchases: [],
    };

    setProducts([...products, product]);
    setNewProduct({ name: "", category: "шампунь" });
  };

  const addPurchase = () => {
    if (
      !newPurchase.productId ||
      !newPurchase.datePurchased ||
      newPurchase.price <= 0
    )
      return;

    const purchase: Purchase = {
      id: Date.now().toString(),
      datePurchased: newPurchase.datePurchased,
      dateEnded: newPurchase.dateEnded || null,
      price: newPurchase.price,
      quantity: newPurchase.quantity,
      notes: newPurchase.notes,
    };

    setProducts(
      products.map((p) =>
        p.id === newPurchase.productId
          ? { ...p, purchases: [...p.purchases, purchase] }
          : p,
      ),
    );

    setNewPurchase({
      productId: "",
      datePurchased: "",
      dateEnded: "",
      price: 0,
      quantity: 1,
      notes: "",
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>🏠 Household Tracker</h1>

      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Додати новий засіб</h2>
        <input
          type="text"
          placeholder="Назва (напр. шампунь L'Oreal)"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="шампунь">Шампунь</option>
          <option value="туалетний папір">Туалетний папір</option>
          <option value="крем">Крем</option>
          <option value="паста">Паста для зубів</option>
          <option value="інше">Інше</option>
        </select>
        <button
          onClick={addProduct}
          style={{
            padding: "10px 20px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Додати засіб
        </button>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Всі засоби</h2>
        {products.length === 0 ? (
          <p>Немає додаених засобів. Додай свій перший!</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ display: "flex", justifyContent: "space-between" }}>
                {product.name}
                <span style={{ fontSize: "14px", color: "#666" }}>
                  {product.category}
                </span>
              </h3>

              <button
                onClick={() => deleteProduct(product.id)}
                style={{
                  padding: "5px 10px",
                  background: "#f44",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginBottom: "15px",
                }}
              >
                Видалити
              </button>

              {product.purchases.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  <h4>Історія покупок:</h4>
                  {product.purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      style={{
                        padding: "10px",
                        background: "#f9f9f9",
                        marginBottom: "8px",
                        borderRadius: "4px",
                      }}
                    >
                      <div>
                        Куплено:{" "}
                        {new Date(purchase.datePurchased).toLocaleDateString(
                          "uk-UA",
                        )}
                      </div>
                      <div>
                        Закінчився:{" "}
                        {purchase.dateEnded
                          ? new Date(purchase.dateEnded).toLocaleDateString(
                              "uk-UA",
                            )
                          : "ще не закінчився"}
                      </div>
                      <div>Ціна: {purchase.price} ₴</div>
                      {purchase.quantity && purchase.quantity > 1 && (
                        <div>Кількість: {purchase.quantity} шт</div>
                      )}
                      {purchase.notes && <div>Примітка: {purchase.notes}</div>}
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  padding: "15px",
                  background: "#e8f5e9",
                  borderRadius: "4px",
                }}
              >
                <h4>Додати нову покупку для {product.name}</h4>
                <input
                  type="date"
                  value={newPurchase.datePurchased}
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      datePurchased: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="date"
                  value={newPurchase.dateEnded}
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      dateEnded: e.target.value,
                    })
                  }
                  placeholder="Дата закінчення"
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="number"
                  placeholder="Ціна (₴)"
                  value={newPurchase.price || ""}
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      price: parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="number"
                  placeholder="Кількість (шт в уп)"
                  value={newPurchase.quantity || ""}
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Примітка"
                  value={newPurchase.notes}
                  onChange={(e) =>
                    setNewPurchase({ ...newPurchase, notes: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <button
                  onClick={() =>
                    setNewPurchase({ ...newPurchase, productId: product.id })
                  }
                  disabled={!newPurchase.productId}
                  style={{
                    padding: "8px 16px",
                    background: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Обрати цей засіб
                </button>
                <button
                  onClick={addPurchase}
                  disabled={!newPurchase.productId}
                  style={{
                    padding: "8px 16px",
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  Додати покупку
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HouseholdTracker;
