import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import FormField from '../components/FormField';
import { btnDanger, btnSecondary, inputStyle } from '../styles';
import { fmtDateTime, getStock } from '../helpers';

export default function WriteDown() {
  const { products, categories, movements, addMovement } = useData();
  const { showToast } = useToast();
  const { session } = useAuth();

  const stock = getStock(movements, products);

  const [form, setForm] = useState({ product_id: '', quantity: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));
  const currentStock = selectedProduct ? stock[selectedProduct.id] ?? 0 : 0;
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
    const qty = parseInt(form.quantity);
    if (!form.quantity || qty <= 0) e.quantity = 'Enter a valid quantity (> 0)';
    else if (selectedProduct && qty > currentStock)
      e.quantity = `Cannot exceed current stock (${currentStock} ${selectedProduct.unit})`;
    if (!form.notes.trim()) e.notes = 'Reason is required';
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
      supplier_id: null,
      user_id: session?.user?.id || null,
      movement_type: 'OUT',
      quantity: parseInt(form.quantity),
      notes: form.notes,
    });
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(`Written down ${form.quantity} × ${selectedProduct.name}`, 'success');
    setForm({ product_id: '', quantity: '', notes: '' });
  }

  const qty = parseInt(form.quantity) || 0;
  const remaining = currentStock - qty;

  return (
    <div>
      <PageHeader
        title="Write-Down"
        subtitle="Record outgoing goods or stock reductions — decreases stock level"
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
            New Outbound / Write-Down
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
                    <strong
                      style={{
                        color:
                          currentStock <= selectedProduct.min_stock ? '#d97706' : '#15803d',
                      }}
                    >
                      {currentStock}
                    </strong>
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

            {selectedProduct && qty > 0 && qty <= currentStock && (
              <div
                style={{
                  background: remaining <= selectedProduct.min_stock ? '#fef9c3' : '#f0fdf4',
                  border: `1px solid ${
                    remaining <= selectedProduct.min_stock ? '#fde68a' : '#bbf7d0'
                  }`,
                  borderRadius: 7,
                  padding: '9px 13px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: remaining <= selectedProduct.min_stock ? '#92400e' : '#166534',
                }}
              >
                {remaining <= selectedProduct.min_stock && <span>⚠ </span>}
                Stock after write-down:{' '}
                <strong>
                  {remaining} {selectedProduct.unit}
                </strong>
                {remaining <= selectedProduct.min_stock && ' — below minimum threshold'}
              </div>
            )}

            <FormField label="Reason / Notes *" error={errors.notes}>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. Issued to department, damaged, expired..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" disabled={saving} style={{ ...btnDanger, flex: 1 }}>
                {saving ? 'Saving…' : 'Record Write-Down'}
              </button>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => {
                  setForm({ product_id: '', quantity: '', notes: '' });
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
            Recent Write-Downs
          </div>
          <Table
            columns={[
              { key: 'date', label: 'Date/Time' },
              { key: 'product', label: 'Product' },
              { key: 'sku', label: 'SKU' },
              { key: 'qty', label: 'Qty', right: true },
              { key: 'notes', label: 'Reason' },
            ]}
            rows={[...movements]
              .filter((m) => m.movement_type === 'OUT')
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((m) => {
                const p = products.find((x) => x.id === m.product_id);
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
                    <span style={{ fontWeight: 700, color: '#b91c1c' }}>−{m.quantity}</span>
                  ),
                  notes: m.notes || <span style={{ color: '#94a3b8' }}>—</span>,
                };
              })}
            emptyMsg="No write-downs yet"
          />
        </div>
      </div>
    </div>
  );
}
