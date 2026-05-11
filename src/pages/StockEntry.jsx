import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import FormField from '../components/FormField';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import { fmtDateTime, getStock } from '../helpers';

export default function StockEntry() {
  const { products, suppliers, categories, movements, addMovement } = useData();
  const { showToast } = useToast();
  const { session } = useAuth();

  const stock = getStock(movements, products);

  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    supplier_id: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));
  const selectedCategory = selectedProduct
    ? categories.find((c) => c.id === selectedProduct.category_id)
    : null;

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.product_id) e.product_id = 'Please select a product';
    if (!form.quantity || parseInt(form.quantity) <= 0)
      e.quantity = 'Enter a valid quantity (> 0)';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    const { error } = await addMovement({
      product_id: parseInt(form.product_id),
      supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      user_id: session?.user?.id || null,
      movement_type: 'IN',
      quantity: parseInt(form.quantity),
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(`Added ${form.quantity} × ${selectedProduct.name} to stock`, 'success');
    setForm({ product_id: '', quantity: '', supplier_id: '', notes: '' });
  }

  return (
    <div>
      <PageHeader
        title="Stock Entry"
        subtitle="Record incoming goods — increases stock level"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            New Inbound Entry
          </div>
          <form onSubmit={handleSubmit}>
            <FormField label="Product *" error={errors.product_id}>
              <select
                value={form.product_id}
                onChange={(e) => set('product_id', e.target.value)}
                style={inputStyle}
              >
                <option value="">— Select product —</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {products
                      .filter((p) => p.category_id === cat.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </FormField>

            {selectedProduct && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>SKU:</span>{' '}
                    <span style={{ fontFamily: 'IBM Plex Mono', fontWeight: 500 }}>
                      {selectedProduct.sku}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Unit:</span> {selectedProduct.unit}
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Category:</span>{' '}
                    {selectedCategory?.name}
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Current Stock:</span>{' '}
                    <strong>{stock[selectedProduct.id] ?? 0}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Min Stock:</span>{' '}
                    {selectedProduct.min_stock}
                  </div>
                </div>
              </div>
            )}

            <FormField
              label={`Quantity ${selectedProduct ? `(${selectedProduct.unit})` : ''} *`}
              error={errors.quantity}
            >
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                placeholder="Enter quantity"
                style={inputStyle}
              />
            </FormField>

            {selectedProduct && form.quantity && parseInt(form.quantity) > 0 && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 7,
                  padding: '9px 13px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#166534',
                }}
              >
                New stock level will be:{' '}
                <strong>
                  {(stock[selectedProduct.id] ?? 0) + parseInt(form.quantity)}{' '}
                  {selectedProduct.unit}
                </strong>
              </div>
            )}

            <FormField label="Supplier (optional)">
              <select
                value={form.supplier_id}
                onChange={(e) => set('supplier_id', e.target.value)}
                style={inputStyle}
              >
                <option value="">— Select supplier —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Notes (optional)">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. Delivery reference, condition notes..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 1 }}>
                {saving ? 'Saving…' : 'Record Entry'}
              </button>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => {
                  setForm({ product_id: '', quantity: '', supplier_id: '', notes: '' });
                  setErrors({});
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Recent Stock Entries
          </div>
          <Table
            columns={[
              { key: 'date', label: 'Date/Time' },
              { key: 'product', label: 'Product' },
              { key: 'sku', label: 'SKU' },
              { key: 'qty', label: 'Qty', right: true },
              { key: 'supplier', label: 'Supplier' },
              { key: 'notes', label: 'Notes' },
            ]}
            rows={[...movements]
              .filter((m) => m.movement_type === 'IN')
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((m) => {
                const p = products.find((x) => x.id === m.product_id);
                const s = suppliers.find((x) => x.id === m.supplier_id);
                return {
                  date: (
                    <span
                      style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#64748b' }}
                    >
                      {fmtDateTime(m.created_at)}
                    </span>
                  ),
                  product: p?.name,
                  sku: (
                    <span
                      style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#64748b' }}
                    >
                      {p?.sku}
                    </span>
                  ),
                  qty: (
                    <span style={{ fontWeight: 700, color: '#15803d' }}>+{m.quantity}</span>
                  ),
                  supplier: s?.name || <span style={{ color: '#94a3b8' }}>—</span>,
                  notes: m.notes || <span style={{ color: '#94a3b8' }}>—</span>,
                };
              })}
            emptyMsg="No inbound entries yet"
          />
        </div>
      </div>
    </div>
  );
}
