import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

function rowToVoucher(row) {
  return {
    id:        row.id,
    store:     row.store,
    barcode:   row.barcode,
    amount:    row.amount,
    remaining: row.remaining,
    currency:  row.currency,
    location:  row.location,
    expiredBy: row.expired_by || "",
    status:    row.status,
    category:  row.category,
    color:     row.color,
    notes:     row.notes,
    favorite:  row.favorite,
    photo:     row.photo_url || null,
  };
}

function voucherToRow(v, userId) {
  const row = {
    store:      v.store,
    barcode:    v.barcode || "",
    amount:     parseFloat(v.amount) || 0,
    remaining:  parseFloat(v.remaining) || 0,
    currency:   v.currency || "₪",
    location:   v.location || "",
    expired_by: v.expiredBy || null,
    status:     v.status || "active",
    category:   v.category || "",
    color:      v.color || "#C7CEEA",
    notes:      v.notes || "",
    favorite:   !!v.favorite,
    photo_url:  v.photo_url || null,
    updated_at: new Date().toISOString(),
  };
  if (userId) row.user_id = userId;
  return row;
}

export function useVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (!cancelled) setLoading(false); return; }
        const { data, error } = await supabase
          .from("vouchers")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (!cancelled) setVouchers((data || []).map(rowToVoucher));
      } catch (e) {
        console.error("Failed to load vouchers:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addVoucher = useCallback(async (formData, photoFile) => {
    const { data: { user } } = await supabase.auth.getUser();
    let photoUrl = null;

    if (photoFile) {
      const ext  = photoFile.type === "image/png" ? "png" : "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("percy-photos")
        .upload(path, photoFile, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("percy-photos")
          .getPublicUrl(path);
        photoUrl = urlData?.publicUrl || null;
      }
      // fallback: store base64 directly if storage upload failed
      if (!photoUrl && formData.photo) photoUrl = formData.photo;
    }

    const row = voucherToRow(formData, user.id);
    row.photo_url = photoUrl;

    const { data, error } = await supabase
      .from("vouchers")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    const newVoucher = rowToVoucher(data);
    setVouchers(prev => [newVoucher, ...prev]);
    return newVoucher;
  }, []);

  const updateVoucher = useCallback(async (id, formData, photoFile) => {
    const { data: { user } } = await supabase.auth.getUser();
    let photoUrl = formData.photo_url;

    if (photoFile) {
      const ext  = photoFile.type === "image/png" ? "png" : "jpg";
      const path = `${user.id}/${id}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("percy-photos")
        .upload(path, photoFile, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("percy-photos")
          .getPublicUrl(path);
        photoUrl = urlData?.publicUrl || null;
      }
      // fallback: store base64 directly if storage upload failed
      if (!photoUrl && formData.photo) photoUrl = formData.photo;
    }

    const row = voucherToRow(formData);
    row.photo_url = photoUrl;

    const { data, error } = await supabase
      .from("vouchers")
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const updated = rowToVoucher(data);
    setVouchers(prev => prev.map(v => v.id === id ? updated : v));
    return updated;
  }, []);

  const deleteVoucher = useCallback(async (id) => {
    const { error } = await supabase.from("vouchers").delete().eq("id", id);
    if (error) throw error;
    setVouchers(prev => prev.filter(v => v.id !== id));
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const voucher = vouchers.find(v => v.id === id);
    if (!voucher) return;
    await supabase.from("vouchers").update({ favorite: !voucher.favorite }).eq("id", id);
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, favorite: !v.favorite } : v));
  }, [vouchers]);

  const markUsed = useCallback(async (id) => {
    await supabase.from("vouchers").update({ status: "used", remaining: 0 }).eq("id", id);
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, status: "used", remaining: 0 } : v));
  }, []);

  return { vouchers, loading, addVoucher, updateVoucher, deleteVoucher, toggleFavorite, markUsed };
}
