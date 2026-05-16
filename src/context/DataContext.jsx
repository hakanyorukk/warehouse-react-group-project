import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [staff, setStaff] = useState([]); // staff_directory: id, full_name, role (all users)
  const [users, setUsers] = useState([]); // full profiles (admin sees all, staff sees own)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pr, cr, sr, mr, sd, us] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('stock_movements').select('*').order('created_at', { ascending: false }),
        supabase.from('staff_directory').select('*'),
        supabase.from('profiles').select('*').order('full_name'),
      ]);
      if (pr.error) throw pr.error;
      if (cr.error) throw cr.error;
      if (sr.error) throw sr.error;
      if (mr.error) throw mr.error;
      setProducts(pr.data || []);
      setCategories(cr.data || []);
      setSuppliers(sr.data || []);
      setMovements(mr.data || []);
      setStaff(sd.data || []);
      setUsers(us.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const sortByName = (a, b) => a.name.localeCompare(b.name);

  async function addProduct(payload) {
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (!error && data) setProducts((prev) => [...prev, data].sort(sortByName));
    return { data, error };
  }

  async function updateProduct(id, fields) {
    const { data, error } = await supabase
      .from('products')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (!error && data)
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)).sort(sortByName));
    return { data, error };
  }

  async function addMovement(payload) {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert(payload)
      .select()
      .single();
    if (!error && data) setMovements((prev) => [data, ...prev]);
    return { data, error };
  }

  async function updateProfile(id, fields) {
    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
      setStaff((prev) =>
        prev.map((s) =>
          s.id === id ? { id: data.id, full_name: data.full_name, role: data.role } : s
        )
      );
    }
    return { data, error };
  }

  const value = {
    products,
    categories,
    suppliers,
    movements,
    staff,
    users,
    loading,
    error,
    refresh: loadAll,
    addProduct,
    updateProduct,
    addMovement,
    updateProfile,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
