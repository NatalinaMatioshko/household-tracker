"use client";

import React, { useState, useEffect } from "react";

interface Purchase {
  id: string;
  datePurchased: string;
  dateEnded: string | null;
  price: number;
  quantity: number;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  category: "Гігієна" | "Догляд";
  purchases: Purchase[];
}

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
    category: "Гігієна" as "Гігієна" | "Догляд",
    price: 0,
    datePurchased: "",
    quantity: 1,
  });
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newPurchase, setNewPurchase] = useState({
    datePurchased: "",
    dateEnded: "",
    price: 0,
    quantity: 1,
    notes: "",
  });

  // Для редагування засобу
  const [editingProduct, setEditingProduct] = useState<{
    isOpen: boolean;
    productId: string | null;
    name: string;
    category: "Гігієна" | "Догляд";
  }>({
    isOpen: false,
    productId: null,
    name: "",
    category: "Гігієна",
  });

  // Для редагування покупки
  const [editingPurchase, setEditingPurchase] = useState<{
    isOpen: boolean;
    productId: string | null;
    purchaseId: string | null;
    datePurchased: string;
    dateEnded: string;
    price: number;
    quantity: number;
    notes: string;
  }>({
    isOpen: false,
    productId: null,
    purchaseId: null,
    datePurchased: "",
    dateEnded: "",
    price: 0,
    quantity: 1,
    notes: "",
  });

  useEffect(() => {
    localStorage.setItem("householdProducts", JSON.stringify(products));
  }, [products]);

  const addProduct = () => {
    if (
      !newProduct.name.trim() ||
      newProduct.price <= 0 ||
      !newProduct.datePurchased
    )
      return;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      purchases: [
        {
          id: Date.now().toString() + "_1",
          datePurchased: newProduct.datePurchased,
          dateEnded: null,
          price: newProduct.price,
          quantity: newProduct.quantity,
        },
      ],
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      category: "Гігієна",
      price: 0,
      datePurchased: "",
      quantity: 1,
    });
  };

  const addPurchaseToProduct = () => {
    if (
      !selectedProductId ||
      !newPurchase.datePurchased ||
      newPurchase.price <= 0
    )
      return;

    const lastPurchase = products
      .find((p) => p.id === selectedProductId)
      ?.purchases.slice(-1)[0];
    const dateEnded = newPurchase.dateEnded || lastPurchase?.dateEnded || null;

    const purchase: Purchase = {
      id: Date.now().toString(),
      datePurchased: newPurchase.datePurchased,
      dateEnded: dateEnded,
      price: newPurchase.price,
      quantity: newPurchase.quantity,
      notes: newPurchase.notes,
    };

    setProducts(
      products.map((p) =>
        p.id === selectedProductId
          ? { ...p, purchases: [...p.purchases, purchase] }
          : p,
      ),
    );

    setNewPurchase({
      datePurchased: "",
      dateEnded: "",
      price: 0,
      quantity: 1,
      notes: "",
    });
  };

  const fixDateEnded = (
    productId: string,
    purchaseId: string,
    dateEnded: string,
  ) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              purchases: p.purchases.map((pk) =>
                pk.id === purchaseId
                  ? { ...pk, dateEnded: dateEnded || null }
                  : pk,
              ),
            }
          : p,
      ),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const deletePurchase = (productId: string, purchaseId: string) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              purchases: p.purchases.filter((pk) => pk.id !== purchaseId),
            }
          : p,
      ),
    );
  };

  // Open edit product
  const openEditProduct = (product: Product) => {
    setEditingProduct({
      isOpen: true,
      productId: product.id,
      name: product.name,
      category: product.category,
    });
  };

  // Save edit product
  const saveEditProduct = () => {
    if (!editingProduct.productId || !editingProduct.name.trim()) return;

    setProducts(
      products.map((p) =>
        p.id === editingProduct.productId
          ? {
              ...p,
              name: editingProduct.name,
              category: editingProduct.category,
            }
          : p,
      ),
    );

    setEditingProduct({
      isOpen: false,
      productId: null,
      name: "",
      category: "Гігієна",
    });
  };

  // Cancel edit product
  const cancelEditProduct = () => {
    setEditingProduct({
      isOpen: false,
      productId: null,
      name: "",
      category: "Гігієна",
    });
  };

  // Open edit purchase
  const openEditPurchase = (product: Product, purchase: Purchase) => {
    setEditingPurchase({
      isOpen: true,
      productId: product.id,
      purchaseId: purchase.id,
      datePurchased: purchase.datePurchased,
      dateEnded: purchase.dateEnded || "",
      price: purchase.price,
      quantity: purchase.quantity,
      notes: purchase.notes || "",
    });
  };

  // Save edit purchase
  const saveEditPurchase = () => {
    if (
      !editingPurchase.productId ||
      !editingPurchase.purchaseId ||
      !editingPurchase.datePurchased
    )
      return;

    setProducts(
      products.map((p) =>
        p.id === editingPurchase.productId
          ? {
              ...p,
              purchases: p.purchases.map((pk) =>
                pk.id === editingPurchase.purchaseId
                  ? {
                      ...pk,
                      datePurchased: editingPurchase.datePurchased,
                      dateEnded: editingPurchase.dateEnded || null,
                      price: editingPurchase.price,
                      quantity: editingPurchase.quantity,
                      notes: editingPurchase.notes,
                    }
                  : pk,
              ),
            }
          : p,
      ),
    );

    setEditingPurchase({
      isOpen: false,
      productId: null,
      purchaseId: null,
      datePurchased: "",
      dateEnded: "",
      price: 0,
      quantity: 1,
      notes: "",
    });
  };

  // Cancel edit purchase
  const cancelEditPurchase = () => {
    setEditingPurchase({
      isOpen: false,
      productId: null,
      purchaseId: null,
      datePurchased: "",
      dateEnded: "",
      price: 0,
      quantity: 1,
      notes: "",
    });
  };

  const getCategoryColor = (category: string) => {
    return category === "Гігієна" ? "#6366f1" : "#10b981";
  };

  const getCategoryIcon = (category: string) => {
    return category === "Гігієна" ? "🧴" : "💆";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              margin: "0 0 10px 0",
              fontWeight: "bold",
              textShadow: "2px 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            🏠 Household Tracker
          </h1>
          <p
            style={{
              fontSize: "18px",
              margin: "0",
              opacity: 0.9,
            }}
          >
            Відстежуйте свої засоби для гігієни та догляду
          </p>
        </div>

        {/* Додавання нового засобу */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              margin: "0 0 25px 0",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            ✨ Додати новий засіб
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Назва засобу
              </label>
              <input
                type="text"
                placeholder="Напр. Шампунь L'Oreal"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Категорія
              </label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value as "Гігієна" | "Догляд",
                  })
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="Гігієна">🧴 Гігієна</option>
                <option value="Догляд">💆 Догляд</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Ціна (₴)
              </label>
              <input
                type="number"
                placeholder="450"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: parseFloat(e.target.value),
                  })
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Кількість (шт)
              </label>
              <input
                type="number"
                placeholder="1"
                value={newProduct.quantity || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    quantity: parseInt(e.target.value),
                  })
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Дата покупки
              </label>
              <input
                type="date"
                value={newProduct.datePurchased}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    datePurchased: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            onClick={addProduct}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            ✨ Додати засіб
          </button>
        </div>

        {/* Список всіх засобів */}
        <div>
          <h2
            style={{
              fontSize: "28px",
              margin: "0 0 25px 0",
              color: "white",
              textAlign: "center",
              textShadow: "2px 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            📦 Всі засоби
          </h2>

          {products.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "60px",
                borderRadius: "20px",
                textAlign: "center",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              }}
            >
              <p
                style={{
                  fontSize: "24px",
                  color: "#9ca3af",
                  margin: "0",
                }}
              >
                🌟 Немає додаених засобів
              </p>
              <p
                style={{
                  fontSize: "16px",
                  color: "#d1d5db",
                  margin: "10px 0 0 0",
                }}
              >
                Додай свій перший засіб зверху!
              </p>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  marginBottom: "25px",
                }}
              >
                {/* Header засобу */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    padding: "20px",
                    background: `linear-gradient(135deg, ${getCategoryColor(product.category)} 0%, ${getCategoryColor(product.category)}dd 100%)`,
                    borderRadius: "12px",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <span style={{ fontSize: "32px" }}>
                      {getCategoryIcon(product.category)}
                    </span>
                    <div>
                      <h3
                        style={{
                          fontSize: "26px",
                          margin: "0",
                          fontWeight: "bold",
                        }}
                      >
                        {product.name}
                      </h3>
                      <span
                        style={{
                          fontSize: "14px",
                          opacity: 0.9,
                        }}
                      >
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => openEditProduct(product)}
                      style={{
                        padding: "10px 20px",
                        background: "rgba(255,255,255,0.3)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      ✏️ Редагувати
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      style={{
                        padding: "10px 20px",
                        background: "rgba(255,255,255,0.2)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      🗑 Видалити
                    </button>
                  </div>
                </div>

                {/* Історія покупок */}
                {product.purchases.length > 0 && (
                  <div style={{ marginBottom: "25px" }}>
                    <h4
                      style={{
                        fontSize: "20px",
                        margin: "0 0 15px 0",
                        color: "#1f2937",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      📋 Історія покупок ({product.purchases.length})
                    </h4>

                    {product.purchases.map((purchase, index) => (
                      <div
                        key={purchase.id}
                        style={{
                          padding: "20px",
                          background:
                            index === product.purchases.length - 1
                              ? "#e8f5e9"
                              : "#f9f9f9",
                          marginBottom: "12px",
                          borderRadius: "12px",
                          border:
                            index === product.purchases.length - 1
                              ? "2px solid #4CAF50"
                              : "1px solid #e5e7eb",
                          position: "relative",
                        }}
                      >
                        {index === product.purchases.length - 1 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-10px",
                              right: "15px",
                              background: "#4CAF50",
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            ✨ Остання
                          </div>
                        )}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr auto",
                            gap: "15px",
                            marginBottom: "15px",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "5px",
                                fontWeight: "600",
                              }}
                            >
                              Куплено
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                color: "#1f2937",
                                fontWeight: "600",
                              }}
                            >
                              {new Date(
                                purchase.datePurchased,
                              ).toLocaleDateString("uk-UA")}
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "5px",
                                fontWeight: "600",
                              }}
                            >
                              Закінчилася
                            </div>
                            <input
                              type="date"
                              value={purchase.dateEnded || ""}
                              onChange={(e) =>
                                fixDateEnded(
                                  product.id,
                                  purchase.id,
                                  e.target.value,
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                width: "100%",
                                cursor: "pointer",
                              }}
                            />
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "5px",
                                fontWeight: "600",
                              }}
                            >
                              Ціна
                            </div>
                            <div
                              style={{
                                fontSize: "18px",
                                color: "#4CAF50",
                                fontWeight: "bold",
                              }}
                            >
                              {purchase.price} ₴
                            </div>
                          </div>

                          <button
                            onClick={() => openEditPurchase(product, purchase)}
                            style={{
                              padding: "8px 16px",
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                              alignSelf: "center",
                            }}
                          >
                            ✏️ Редагувати
                          </button>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "15px",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "5px",
                                fontWeight: "600",
                              }}
                            >
                              Кількість
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                color: "#1f2937",
                              }}
                            >
                              {purchase.quantity} шт
                            </div>
                          </div>

                          {purchase.notes && (
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  marginBottom: "5px",
                                  fontWeight: "600",
                                }}
                              >
                                Примітка
                              </div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#6b7280",
                                }}
                              >
                                {purchase.notes}
                              </div>
                            </div>
                          )}
                        </div>

                        {product.purchases.length > 1 && (
                          <button
                            onClick={() =>
                              deletePurchase(product.id, purchase.id)
                            }
                            style={{
                              position: "absolute",
                              top: "15px",
                              right: "15px",
                              padding: "6px 12px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Додавання новой покупки */}
                <div
                  style={{
                    padding: "25px",
                    background: "#f0f9ff",
                    borderRadius: "12px",
                    border: "2px solid #3b82f6",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "20px",
                      margin: "0 0 20px 0",
                      color: "#1f2937",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    ➕ Додати нову покупку для {product.name}
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#4b5563",
                          marginBottom: "6px",
                          fontWeight: "600",
                        }}
                      >
                        Дата покупки
                      </label>
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
                          padding: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#4b5563",
                          marginBottom: "6px",
                          fontWeight: "600",
                        }}
                      >
                        Дата закінчення
                      </label>
                      <input
                        type="date"
                        value={newPurchase.dateEnded}
                        onChange={(e) =>
                          setNewPurchase({
                            ...newPurchase,
                            dateEnded: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#4b5563",
                          marginBottom: "6px",
                          fontWeight: "600",
                        }}
                      >
                        Ціна (₴)
                      </label>
                      <input
                        type="number"
                        placeholder="450"
                        value={newPurchase.price || ""}
                        onChange={(e) =>
                          setNewPurchase({
                            ...newPurchase,
                            price: parseFloat(e.target.value),
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr",
                      gap: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#4b5563",
                          marginBottom: "6px",
                          fontWeight: "600",
                        }}
                      >
                        Кількість (шт)
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        value={newPurchase.quantity || ""}
                        onChange={(e) =>
                          setNewPurchase({
                            ...newPurchase,
                            quantity: parseInt(e.target.value),
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#4b5563",
                          marginBottom: "6px",
                          fontWeight: "600",
                        }}
                      >
                        Примітка
                      </label>
                      <input
                        type="text"
                        placeholder="Напр. Купила в АТБ"
                        value={newPurchase.notes}
                        onChange={(e) =>
                          setNewPurchase({
                            ...newPurchase,
                            notes: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={addPurchaseToProduct}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    ➕ Додати покупку
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Модальне вікно редагування засобу */}
      {editingProduct.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                margin: "0 0 30px 0",
                color: "#1f2937",
              }}
            >
              ✏️ Редагувати засіб
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Назва
              </label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Категорія
              </label>
              <select
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value as "Гігієна" | "Догляд",
                  })
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                  background: "white",
                }}
              >
                <option value="Гігієна">🧴 Гігієна</option>
                <option value="Догляд">💆 Догляд</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={saveEditProduct}
                style={{
                  flex: 1,
                  padding: "14px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                💾 Зберегти
              </button>
              <button
                onClick={cancelEditProduct}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ❌ Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування покупки */}
      {editingPurchase.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              maxWidth: "600px",
              width: "90%",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                margin: "0 0 30px 0",
                color: "#1f2937",
              }}
            >
              ✏️ Редагувати покупку
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "#4b5563",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Дата покупки
                </label>
                <input
                  type="date"
                  value={editingPurchase.datePurchased}
                  onChange={(e) =>
                    setEditingPurchase({
                      ...editingPurchase,
                      datePurchased: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "16px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "#4b5563",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Дата закінчення
                </label>
                <input
                  type="date"
                  value={editingPurchase.dateEnded}
                  onChange={(e) =>
                    setEditingPurchase({
                      ...editingPurchase,
                      dateEnded: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "16px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "#4b5563",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Ціна (₴)
                </label>
                <input
                  type="number"
                  value={editingPurchase.price || ""}
                  onChange={(e) =>
                    setEditingPurchase({
                      ...editingPurchase,
                      price: parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "16px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "#4b5563",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Кількість (шт)
                </label>
                <input
                  type="number"
                  value={editingPurchase.quantity || ""}
                  onChange={(e) =>
                    setEditingPurchase({
                      ...editingPurchase,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "16px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Примітка
              </label>
              <input
                type="text"
                value={editingPurchase.notes}
                onChange={(e) =>
                  setEditingPurchase({
                    ...editingPurchase,
                    notes: e.target.value,
                  })
                }
                placeholder="Напр. Купила в АТБ"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={saveEditPurchase}
                style={{
                  flex: 1,
                  padding: "14px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                💾 Зберегти
              </button>
              <button
                onClick={cancelEditPurchase}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ❌ Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdTracker;
