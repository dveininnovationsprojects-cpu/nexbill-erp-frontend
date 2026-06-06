import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CashierProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    axios.get('/api/products/all', {
      headers: { Authorization: `Bearer ${user.token}` },
      withCredentials: true,
    }).then(async res => {
      const prods = res.data || [];
      if (prods.length) {
        const invData = await Promise.allSettled(
          prods.map(p => axios.get(`/api/inventory/product/${p.id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
            withCredentials: true,
          }))
        );
        const merged = prods.map((p, i) => ({
          ...p,
          stock: invData[i].status === 'fulfilled' ? parseFloat(invData[i].value.data.availableQuantity ?? 0) : 0,
          minStock: invData[i].status === 'fulfilled' ? parseFloat(invData[i].value.data.reorderLevel ?? 0) : 0,
          gstRate: p.gstPercentage ?? p.gstRate ?? 0,
          category: p.category?.name || p.category || '',
        }));
        setProducts(merged);
      } else {
        setProducts([]);
      }
    }).catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map(p => p.category?.name || p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const catName = p.category?.name || p.category || '';
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter ? catName === catFilter : true;
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
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><span style={{display:'inline-block',height:12,width:j===1?120:70,background:'#EFE7DE',borderRadius:4,animation:'pulse 1.5s ease-in-out infinite'}} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="cp-empty">{products.length === 0 ? 'No products found.' : 'No products match search.'}</td></tr>
              ) : filtered.map(p => {
                const stockClass = p.stock === 0 ? 'cp-stock-out' : p.stock < 20 ? 'cp-stock-low' : 'cp-stock-ok';
                const stockLabel = p.stock === 0 ? 'Out of Stock' : p.stock < 20 ? `${p.stock} ⚠` : p.stock;
                return (
                  <tr key={p.id}>
                    <td><span className="cp-sku">{p.sku}</span></td>
                    <td style={{fontWeight:500,color:'#2D2D2D'}}>{p.name}</td>
                    <td><span className="cp-cat">{p.category?.name || p.category}</span></td>
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
