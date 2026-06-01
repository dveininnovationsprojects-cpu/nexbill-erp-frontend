import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, Tag, Receipt, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MOCK_PRODUCTS = [];

export default function CashierBilling() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [txnRef, setTxnRef] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // PaymentMode enum mapping
  const PAY_MODES = [
    { id: 'CASH',        label: 'Cash' },
    { id: 'UPI',         label: 'UPI' },
    { id: 'CARD',        label: 'Card' },
    { id: 'NET_BANKING', label: 'Net Banking' },
  ];

  useEffect(() => {
    api.get('/api/products/all')
      .then(async res => {
        const prods = res.data || [];
        if (prods.length) {
          const invData = await Promise.allSettled(
            prods.map(p => api.get(`/api/inventory/product/${p.id}`))
          );
          const merged = prods.map((p, i) => ({
            ...p,
            stock: invData[i].status === 'fulfilled' ? parseFloat(invData[i].value.data.availableQuantity ?? 0) : 0,
            gstRate: p.gstPercentage ?? p.gstRate ?? 0,
            category: p.category?.name || p.category || '',
          }));
          setProducts(merged.filter(p => p.stock > 0));
        }
      })
      .catch(err => console.error('Products fetch error:', err?.response?.status));
  }, []);

  const filtered = search.length > 0
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const addToCart = async (product) => {
    const price = product.sellingPrice || product.price || 0;
    // Optimistic UI update
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, price, qty: 1 }];
    });
    // Sync with backend cart
    try {
      await api.post('/api/cart/add', { productId: product.id, quantity: 1 });
    } catch (err) {
      const msg = err?.response?.data || 'Failed to add to cart';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
      // Rollback
      setCart(prev => {
        const item = prev.find(i => i.id === product.id);
        if (item?.qty === 1) return prev.filter(i => i.id !== product.id);
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty - 1 } : i);
      });
    }
  };

  const updateQty = async (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
      try { await api.delete(`/api/cart/remove/${id}`); } catch {}
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
      try { await api.put('/api/cart/update', { productId: id, quantity: newQty }); } catch {}
    }
  };

  const removeItem = async (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    try { await api.delete(`/api/cart/remove/${id}`); } catch {}
  };

  const clearCart = async () => {
    setCart([]); setDiscount('');
    try { await api.delete('/api/cart/clear'); } catch {}
  };

  const openInvoice = () => { setPaymentMethod(null); setPaymentStatus(null); setTxnRef(''); setInvoiceModal(true); };

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setSubmitting(true);
    setPaymentStatus('processing');
    try {
      const res = await api.post('/api/billing/checkout', { paymentMethod });
      setPaymentStatus('success');
      setTimeout(() => {
        setInvoiceModal(false);
        clearCart();
        navigate(user?.role === 'ADMIN' ? '/admin/invoices' : '/cashier/invoices');
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Payment failed!';
      setPaymentStatus('failed');
      console.error('Checkout error:', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => { setPaymentStatus(null); };

  // Calculations
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const gstBreakdown = cart.reduce((acc, i) => {
    const base = i.price * i.qty;
    const gstAmt = base * i.gstRate / 100;
    const key = i.gstRate;
    acc[key] = (acc[key] || 0) + gstAmt;
    return acc;
  }, {});
  const totalGst = Object.values(gstBreakdown).reduce((s, v) => s + v, 0);
  const discountVal = discount
    ? discountType === 'percent'
      ? subtotal * parseFloat(discount) / 100
      : parseFloat(discount)
    : 0;
  const grandTotal = subtotal + totalGst - discountVal;

  return (
    <>
      <style>{`
        .bill-page{display:grid;grid-template-columns:1fr 380px;gap:20px;font-family:'Inter',system-ui,sans-serif;height:calc(100vh - 100px)}
        /* Left */
        .bill-left{display:flex;flex-direction:column;gap:16px;overflow:hidden}
        .bill-search-wrap{position:relative}
        .bill-search-wrap input{width:100%;padding:11px 14px 11px 40px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .bill-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .bill-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#8B7355}
        .bill-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;overflow-y:auto;padding-bottom:8px}
        .bill-product-card{background:#FFFFFF;border:1.5px solid #EFE7DE;border-radius:12px;padding:14px;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;gap:6px}
        .bill-product-card:hover{border-color:#C6A969;box-shadow:0 2px 12px rgba(198,169,105,0.15);transform:translateY(-1px)}
        .bill-product-card.in-cart{border-color:#C6A969;background:#FDFAF5}
        .bill-p-cat{font-size:10px;color:#8B7355;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
        .bill-p-name{font-size:13px;font-weight:600;color:#2D2D2D;line-height:1.3}
        .bill-p-sku{font-size:10px;color:#D6D3D1}
        .bill-p-price{font-size:15px;font-weight:700;color:#2D2D2D}
        .bill-p-gst{font-size:10px;color:#8B7355}
        .bill-p-add{display:flex;align-items:center;justify-content:center;gap:4px;padding:6px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;margin-top:4px}
        .bill-p-add:hover{background:#C6A969;color:#2D2D2D}
        .bill-p-add.added{background:#C6A969;color:#2D2D2D}
        /* Right - Cart */
        .bill-right{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .bill-cart-header{padding:16px 20px;border-bottom:1px solid #EFE7DE;display:flex;align-items:center;justify-content:space-between}
        .bill-cart-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#2D2D2D}
        .bill-cart-count{background:#2D2D2D;color:#C6A969;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px}
        .bill-clear-btn{font-size:12px;color:#8B7355;background:none;border:none;cursor:pointer;font-family:inherit}
        .bill-clear-btn:hover{color:#9B4444}
        .bill-cart-items{flex:1;overflow-y:auto;padding:12px}
        .bill-cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;color:#D6D3D1;font-size:13px}
        .bill-cart-item{display:flex;align-items:center;gap:10px;padding:10px;background:#F8F5F2;border-radius:10px;margin-bottom:8px;border:1px solid #EFE7DE}
        .bill-item-info{flex:1;min-width:0}
        .bill-item-name{font-size:12px;font-weight:600;color:#2D2D2D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bill-item-price{font-size:11px;color:#8B7355}
        .bill-qty-ctrl{display:flex;align-items:center;gap:6px}
        .bill-qty-btn{width:24px;height:24px;border:1.5px solid #EFE7DE;border-radius:6px;background:#FFFFFF;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#3F3F46;transition:all 0.2s}
        .bill-qty-btn:hover{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .bill-qty-num{font-size:13px;font-weight:700;color:#2D2D2D;min-width:20px;text-align:center}
        .bill-item-total{font-size:12px;font-weight:700;color:#2D2D2D;min-width:50px;text-align:right}
        .bill-remove-btn{background:none;border:none;cursor:pointer;color:#D6D3D1;padding:2px;display:flex;align-items:center}
        .bill-remove-btn:hover{color:#9B4444}
        /* Summary */
        .bill-summary{border-top:1px solid #EFE7DE;padding:16px 20px;display:flex;flex-direction:column;gap:10px}
        .bill-summary-row{display:flex;justify-content:space-between;font-size:13px;color:#3F3F46}
        .bill-summary-row.gst{color:#8B7355;font-size:12px}
        .bill-summary-row.discount{color:#5A7A5A}
        .bill-divider{border:none;border-top:1px dashed #EFE7DE;margin:4px 0}
        .bill-total-row{display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#2D2D2D}
        /* Discount */
        .bill-discount-wrap{display:flex;gap:8px;align-items:center}
        .bill-discount-wrap input{flex:1;padding:8px 10px;border:1.5px solid #EFE7DE;border-radius:8px;font-size:13px;outline:none;font-family:inherit;background:#F8F5F2;color:#2D2D2D}
        .bill-discount-wrap input:focus{border-color:#C6A969}
        .bill-discount-wrap select{padding:8px 10px;border:1.5px solid #EFE7DE;border-radius:8px;font-size:12px;outline:none;font-family:inherit;background:#F8F5F2;color:#2D2D2D;cursor:pointer}
        .bill-checkout-btn{padding:13px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .bill-checkout-btn:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .bill-checkout-btn:disabled{opacity:0.4;cursor:not-allowed}
        /* Invoice Modal */
        .bill-overlay{position:fixed;inset:0;background:rgba(45,45,45,0.5);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .bill-invoice{background:#FFFFFF;border-radius:18px;width:100%;max-width:420px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(45,45,45,0.2);overflow:hidden}
        .bill-invoice-header{background:#2D2D2D;padding:24px;text-align:center;color:#F8F5F2;flex-shrink:0}
        .bill-invoice-header h3{margin:0 0 4px;font-size:18px;font-weight:700}
        .bill-invoice-header p{margin:0;font-size:12px;color:#8B7355}
        .bill-invoice-body{padding:20px 24px;overflow-y:auto;flex:1}
        .bill-invoice-row{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid #F8F5F2;color:#3F3F46}
        .bill-invoice-total{display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#2D2D2D;padding:12px 0 0}
        .bill-invoice-actions{display:flex;gap:10px;padding:12px 24px;border-top:1px solid #EFE7DE;flex-shrink:0}
        .bill-invoice-close{flex:1;padding:11px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit}
        .bill-invoice-print{flex:1;padding:11px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .bill-invoice-print:hover{background:#C6A969;color:#2D2D2D}
        .pay-section{padding:16px 24px;border-top:1px solid #EFE7DE;flex-shrink:0}
        .pay-label{font-size:12px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:10px}
        .pay-methods{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
        .pay-btn{padding:10px 8px;border:1.5px solid #EFE7DE;border-radius:10px;background:#F8F5F2;font-size:12px;font-weight:600;color:#3F3F46;cursor:pointer;font-family:inherit;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px}
        .pay-btn:hover{border-color:#C6A969;color:#2D2D2D}
        .pay-btn.selected{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .pay-confirm-btn{width:100%;padding:12px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .pay-confirm-btn:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .pay-confirm-btn:disabled{opacity:0.5;cursor:not-allowed}
        .pay-status{text-align:center;padding:16px 0}
        .pay-status-icon{font-size:36px;margin-bottom:8px}
        .pay-status-text{font-size:15px;font-weight:700;color:#2D2D2D;margin-bottom:4px}
        .pay-status-sub{font-size:12px;color:#8B7355}
        .pay-retry-btn{margin-top:12px;padding:9px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit}
        .pay-retry-btn:hover{background:#EFE7DE;color:#2D2D2D}
        .pay-processing{display:flex;align-items:center;justify-content:center;gap:10px;padding:16px 0;font-size:13px;color:#8B7355}
        .pay-spinner{width:18px;height:18px;border:2px solid #EFE7DE;border-top-color:#C6A969;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Invoice Preview Modal */}
      {invoiceModal && (
        <div className="bill-overlay" onClick={() => setInvoiceModal(false)}>
          <div className="bill-invoice" onClick={e => e.stopPropagation()}>
            <div className="bill-invoice-header">
              <h3>NexBill ERP</h3>
              <p>Invoice Preview · {new Date().toLocaleDateString()}</p>
            </div>
            <div className="bill-invoice-body">
              {cart.map(i => (
                <div key={i.id} className="bill-invoice-row">
                  <span>{i.name} × {i.qty}</span>
                  <span>₹{(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="bill-invoice-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              {Object.entries(gstBreakdown).map(([rate, amt]) => (
                <div key={rate} className="bill-invoice-row" style={{color:'#8B7355',fontSize:12}}>
                  <span>GST {rate}% (CGST {rate/2}% + SGST {rate/2}%)</span>
                  <span>₹{amt.toFixed(2)}</span>
                </div>
              ))}
              {discountVal > 0 && <div className="bill-invoice-row" style={{color:'#5A7A5A'}}><span>Discount</span><span>-₹{discountVal.toFixed(2)}</span></div>}
              <div className="bill-invoice-total"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
            </div>
            <div className="bill-invoice-actions">
              <button className="bill-invoice-close" onClick={() => setInvoiceModal(false)}>Close</button>
              <button className="bill-invoice-print" onClick={() => window.print()}>Print Invoice</button>
            </div>

            {/* Payment Section */}
            <div className="pay-section">
              {paymentStatus === 'processing' ? (
                <div className="pay-processing">
                  <span className="pay-spinner" /> Processing payment...
                </div>
              ) : paymentStatus === 'success' ? (
                <div className="pay-status">
                  <div className="pay-status-icon">✅</div>
                  <div className="pay-status-text">Payment Successful!</div>
                  <div className="pay-status-sub">via {paymentMethod?.toUpperCase()}</div>
                  <button className="pay-confirm-btn" style={{marginTop:12}} onClick={() => { setInvoiceModal(false); clearCart(); }}>
                    New Bill
                  </button>
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="pay-status">
                  <div className="pay-status-icon">❌</div>
                  <div className="pay-status-text">Payment Failed</div>
                  <div className="pay-status-sub">Please try again</div>
                  <button className="pay-retry-btn" onClick={handleRetry}>Retry</button>
                </div>
              ) : (
                <>
                  <div className="pay-label">Customer ID (optional)</div>
                  <input
                    type="number"
                    placeholder="Walk-in = leave empty"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    style={{width:'100%',padding:'8px 10px',border:'1.5px solid #EFE7DE',borderRadius:8,fontSize:13,outline:'none',fontFamily:'inherit',background:'#F8F5F2',color:'#2D2D2D',boxSizing:'border-box',marginBottom:10}}
                  />
                  <div className="pay-label">Select Payment Method</div>
                  <div className="pay-methods">
                    {PAY_MODES.map(m => (
                      <button
                        key={m.id}
                        className={`pay-btn ${paymentMethod === m.id ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {(paymentMethod === 'UPI' || paymentMethod === 'CARD' || paymentMethod === 'NET_BANKING') && (
                    <input
                      placeholder="Transaction Ref / UTR (optional)"
                      value={txnRef}
                      onChange={e => setTxnRef(e.target.value)}
                      style={{width:'100%',padding:'8px 10px',border:'1.5px solid #EFE7DE',borderRadius:8,fontSize:13,outline:'none',fontFamily:'inherit',background:'#F8F5F2',color:'#2D2D2D',boxSizing:'border-box',marginBottom:10}}
                    />
                  )}
                  <button className="pay-confirm-btn" disabled={!paymentMethod} onClick={handlePayment}>
                    Confirm Payment · ₹{grandTotal.toFixed(2)}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bill-page">
        {/* Left — Product Search */}
        <div className="bill-left">
          <div className="bill-search-wrap">
            <Search size={16} className="bill-search-icon" />
            <input
              placeholder="Search product by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="bill-products">
            {filtered.length === 0 ? (
              <div style={{gridColumn:'1/-1',textAlign:'center',padding:'40px',color:'#D6D3D1',fontSize:13}}>
                {products.length === 0 ? 'No products available' : 'No products match search'}
              </div>
            ) : filtered.map(p => {
              const inCart = cart.find(i => i.id === p.id);
              return (
                <div key={p.id} className={`bill-product-card ${inCart ? 'in-cart' : ''}`} onClick={() => addToCart(p)}>
                  <div className="bill-p-cat">{p.category?.name || p.category}</div>
                  <div className="bill-p-name">{p.name}</div>
                  <div className="bill-p-sku">{p.sku}</div>
                  <div className="bill-p-price">₹{(p.sellingPrice || p.price || 0).toLocaleString()}</div>
                  <div className="bill-p-gst">GST: {p.gstPercentage || p.gstRate || 0}%</div>
                  <button className={`bill-p-add ${inCart ? 'added' : ''}`}>
                    <Plus size={12} /> {inCart ? `In Cart (${inCart.qty})` : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Cart */}
        <div className="bill-right">
          <div className="bill-cart-header">
            <div className="bill-cart-title">
              <ShoppingCart size={16} />
              Cart
              {cart.length > 0 && <span className="bill-cart-count">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
            </div>
            {cart.length > 0 && <button className="bill-clear-btn" onClick={clearCart}>Clear all</button>}
          </div>

          <div className="bill-cart-items">
            {cart.length === 0 ? (
              <div className="bill-cart-empty">
                <ShoppingCart size={36} />
                <p>Cart is empty</p>
                <span>Click a product to add</span>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bill-cart-item">
                  <div className="bill-item-info">
                    <div className="bill-item-name">{item.name}</div>
                    <div className="bill-item-price">₹{item.price} × {item.qty}</div>
                  </div>
                  <div className="bill-qty-ctrl">
                    <button className="bill-qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={11} /></button>
                    <span className="bill-qty-num">{item.qty}</span>
                    <button className="bill-qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={11} /></button>
                  </div>
                  <div className="bill-item-total">₹{(item.price * item.qty).toLocaleString()}</div>
                  <button className="bill-remove-btn" onClick={() => removeItem(item.id)}><X size={14} /></button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="bill-summary">
            <div className="bill-summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>

            {/* GST Breakdown */}
            {Object.entries(gstBreakdown).map(([rate, amt]) => (
              <div key={rate} className="bill-summary-row gst">
                <span>GST {rate}% (CGST {rate/2}% + SGST {rate/2}%)</span>
                <span>₹{amt.toFixed(2)}</span>
              </div>
            ))}

            {/* Discount */}
            <div className="bill-discount-wrap">
              <Tag size={14} style={{color:'#8B7355',flexShrink:0}} />
              <input
                type="number"
                placeholder="Discount"
                min="0"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
              />
              <select value={discountType} onChange={e => setDiscountType(e.target.value)}>
                <option value="percent">%</option>
                <option value="flat">₹</option>
              </select>
            </div>

            {discountVal > 0 && (
              <div className="bill-summary-row discount">
                <span>Discount</span><span>-₹{discountVal.toFixed(2)}</span>
              </div>
            )}

            <hr className="bill-divider" />
            <div className="bill-total-row">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button
              className="bill-checkout-btn"
              disabled={cart.length === 0}
              onClick={() => openInvoice()}
            >
              <Receipt size={16} /> Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
