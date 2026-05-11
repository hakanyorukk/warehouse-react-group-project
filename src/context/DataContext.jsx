import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pr, cr, sr, mr] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('stock_movements').select('*').order('created_at', { ascending: false }),
      ]);
      if (pr.error) throw pr.error;
      if (cr.error) throw cr.error;
      if (sr.error) throw sr.error;
      if (mr.error) throw mr.error;
      setProducts(pr.data || []);
      setCategories(cr.data || []);
      setSuppliers(sr.data || []);
      setMovements(mr.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function addProduct(payload) {
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (!error && data) setProducts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return { data, error };
  }

  async function addMovement(payload) {
    const { data, error } = await supabase.from('stock_movements').insert(payload).select().single();
    if (!error && data) setMovements((prev) => [data, ...prev]);
    return { data, error };
  }

  const value = {
    products,
    categories,
    suppliers,
    movements,
    loading,
    error,
    refresh: loadAll,
    addProduct,
    addMovement,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
