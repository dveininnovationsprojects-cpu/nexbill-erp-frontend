import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FALLBACK = [
  { id: 1, sku: 'SKU001', name: 'Wireless Mouse',   category: 'Electronics', sellingPrice: 599,  stock: 45,  gstRate: 18 },
  { id: 2, sku: 'SKU002', name: 'Rice 5kg',          category: 'Groceries',   sellingPrice: 280,  stock: 8,   gstRate: 5  },
  { id: 3, sku: 'SKU003', name: 'Blue Pen Pack',     category: 'Stationery',  sellingPrice: 45,   stock: 300, gstRate: 12 },
  { id: 4, sku: 'SKU004', name: 'Cotton T-Shirt',    category: 'Clothing',    sellingPrice: 399,  stock: 5,   gstRate: 5  },
  { id: 5, sku: 'SKU005', name: 'Mineral Water 1L',  category: 'Beverages',   sellingPrice: 20,   stock: 500, gstRate: 0  },
  { id: 6, sku: 'SKU006', name: 'Notebook A4',       category: 'Stationery',  sellingPrice: 85,   stock: 12,  gstRate: 12 },
  { id: 7, sku: 'SKU007', name: 'USB-C Cable',       category: 'Electronics', sellingPrice: 249,  stock: 0,   gstRate: 18 },
];

export default function CashierProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState(FALLBACK);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    axios.get('/api/products/all', {
      headers: { Authorization: `Bearer ${user.token}` },
      withCredentials: true,
    }).then(res => { if (res.data?.length) setProducts(res.data); })
      .catch(() => {});
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter ? p.category === catFilter : true;
    return matchSearch && matchCat;
  });

  return (
    <>
      <style>{`
        .cp-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .cp-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .cp-search-wrap{position:relative;flex:1;min-width:200px}
        .cp-search-wrap input{width:100%;padding:10px 14px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .cp-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .cp-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355}
        .cp-select{padding:10px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;cursor:pointer}
        .cp-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .cp-table{width:100%;border-collapse:collapse;font-size:13px}
        .cp-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .cp-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle}
        .cp-table tr:last-child td{border-bottom:none}
        .cp-table tr:hover td{background:#FDFCFB}
        .cp-sku{font-size:11px;color:#8B7355;background:#EFE7DE;padding:2px 8px;border-radius:20px;font-weight:600}
        .cp-cat{font-size:11px;color:#3F3F46;background:#F8F5F2;border:1px solid #EFE7DE;padding:3px 10px;border-radius:20px}
        .cp-stock-ok{color:#2D2D2D;font-weight:600}
        .cp-stock-low{color:#C6A969;font-weight:600}
        .cp-stock-out{color:#9B4444;font-weight:600}
        .cp-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
      `}</style>

      <div className="cp-page">
        <div className="cp-topbar">
          <div className="cp-search-wrap">
            <Search size={15} className="cp-search-icon" />
            <input placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="cp-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="cp-card">
          <table className="cp-table">
            <thead>
              <tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Price</th><th>GST</th><th>Stock</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="cp-empty">No products found.</td></tr>
              ) : filtered.map(p => {
                const stockClass = p.stock === 0 ? 'cp-stock-out' : p.stock < 20 ? 'cp-stock-low' : 'cp-stock-ok';
                const stockLabel = p.stock === 0 ? 'Out of Stock' : p.stock < 20 ? `${p.stock} ⚠` : p.stock;
                return (
                  <tr key={p.id}>
                    <td><span className="cp-sku">{p.sku}</span></td>
                    <td style={{fontWeight:500,color:'#2D2D2D'}}>{p.name}</td>
                    <td><span className="cp-cat">{p.category}</span></td>
                    <td>₹{p.sellingPrice?.toLocaleString()}</td>
                    <td>{p.gstRate}%</td>
                    <td><span className={stockClass}>{stockLabel}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
