import React, { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ImageUploader from '../../components/admin/ImageUploader';
import { fieldClass, labelClass } from '../../components/admin/Modal';
import { exportAllData, saveSettings, subscribeSettings } from '../../lib/db';
import { deleteCloudinaryImages } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { Save, Image as ImageIcon, Truck, Check, Smartphone, Loader2, DatabaseBackup } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [savedHeroId, setSavedHeroId] = useState(null);
  const [backupState, setBackupState] = useState('');

  useEffect(
    () =>
      subscribeSettings(
        (data) => {
          setSettings(data);
          setSavedHeroId((current) => (current === null ? data.heroImagePublicId || '' : current));
        },
        (err) => setError(err.message)
      ),
    []
  );

  if (!settings) {
    return <p className="text-gray-400 text-center py-12">{error || 'Loading settings…'}</p>;
  }

  const save = async (section, patch) => {
    setError('');
    setSaving(section);
    try {
      await saveSettings(patch);
      setSaved(section);
      setTimeout(() => setSaved(''), 3000);
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'Only administrators can change store settings.' : err.message);
    } finally {
      setSaving('');
    }
  };

  // Save the hero image, then delete the previous one from Cloudinary
  const saveHero = async (heroImage, heroImagePublicId) => {
    await save('hero', { heroImage, heroImagePublicId });
    if (savedHeroId && savedHeroId !== heroImagePublicId) deleteCloudinaryImages([savedHeroId]);
    setSavedHeroId(heroImagePublicId);
  };

  const downloadBackup = async () => {
    setBackupState('working');
    setError('');
    try {
      const data = await exportAllData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `living-space-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupState('done');
    } catch (err) {
      setError(`Backup failed: ${err.message}`);
      setBackupState('');
    }
  };

  const setWallet = (wallet, key) => (e) =>
    setSettings((s) => ({ ...s, [wallet]: { ...s[wallet], [key]: e.target.value } }));

  const fee = Number(settings.shippingFee) || 0;
  const threshold = Number(settings.freeShippingThreshold) || 0;

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Configuration" subtitle="Manage global store settings and content" />

      {error && <p className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2" role="alert">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Shipping Settings */}
        <Card icon={Truck} tone="bg-blue-50 text-blue-600" title="Shipping Rules" footer={<SaveButton saving={saving} saved={saved} section="shipping" label="Save Shipping" onClick={() => save('shipping', { shippingFee: fee, freeShippingThreshold: threshold })} />}>
          <div>
            <label htmlFor="s-fee" className={labelClass}>Standard Shipping Fee (Rs.)</label>
            <input id="s-fee" type="number" min="0" value={settings.shippingFee} onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })} className={fieldClass} />
            <p className="text-xs text-gray-500 mt-2">Flat rate per order. Set to 0 for free shipping on everything.</p>
          </div>
          <div>
            <label htmlFor="s-threshold" className={labelClass}>Free Shipping Threshold (Rs.)</label>
            <input id="s-threshold" type="number" min="0" value={settings.freeShippingThreshold} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })} className={fieldClass} />
            <p className="text-xs text-gray-500 mt-2">Orders at or above this amount ship free. Set to 0 to always charge the fee.</p>
          </div>
          <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
            Preview: {fee === 0 ? 'All orders ship free.' : threshold > 0 ? `${formatPrice(fee)} shipping, free on orders of ${formatPrice(threshold)} or more.` : `${formatPrice(fee)} shipping on every order.`}
          </p>
        </Card>

        {/* Payment accounts */}
        <Card
          icon={Smartphone}
          tone="bg-green-50 text-green-600"
          title="JazzCash & EasyPaisa"
          footer={<SaveButton saving={saving} saved={saved} section="payments" label="Save Accounts" onClick={() => save('payments', { jazzcash: settings.jazzcash, easypaisa: settings.easypaisa })} />}
        >
          <p className="text-xs text-gray-500">Customers see these details at checkout. Leave the number empty to hide that payment option. Cash on Delivery is always available.</p>
          {[
            ['jazzcash', 'JazzCash'],
            ['easypaisa', 'EasyPaisa'],
          ].map(([key, label]) => (
            <fieldset key={key} className="grid grid-cols-2 gap-3">
              <legend className="text-sm font-bold text-gray-900 mb-2">{label}</legend>
              <div>
                <label htmlFor={`${key}-number`} className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
                <input id={`${key}-number`} maxLength={20} value={settings[key].accountNumber} onChange={setWallet(key, 'accountNumber')} className={fieldClass} placeholder="03XX XXXXXXX" />
              </div>
              <div>
                <label htmlFor={`${key}-name`} className="block text-xs font-semibold text-gray-600 mb-1">Account Title</label>
                <input id={`${key}-name`} maxLength={60} value={settings[key].accountName} onChange={setWallet(key, 'accountName')} className={fieldClass} />
              </div>
            </fieldset>
          ))}
        </Card>

        {/* Hero Banner Image */}
        <Card
          icon={ImageIcon}
          tone="bg-purple-50 text-purple-600"
          title="Hero Banner Image"
          footer={
            <>
              {settings.heroImage && (
                <button onClick={() => saveHero('', '')} className="text-sm font-medium text-red-600 hover:underline mr-auto">
                  Use default image
                </button>
              )}
              <SaveButton saving={saving} saved={saved} section="hero" label="Save Image" onClick={() => saveHero(settings.heroImage, settings.heroImagePublicId)} />
            </>
          }
        >
          <ImageUploader
            label="First homepage slide (1920×1080 recommended)"
            folder="banners"
            aspect="aspect-video"
            value={settings.heroImage}
            onChange={({ url, publicId }) => setSettings((s) => ({ ...s, heroImage: url, heroImagePublicId: publicId }))}
          />
        </Card>

        {/* Backup */}
        <Card
          icon={DatabaseBackup}
          tone="bg-amber-50 text-amber-600"
          title="Backup"
          footer={
            <button
              onClick={downloadBackup}
              disabled={backupState === 'working'}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-60"
            >
              {backupState === 'working' ? <Loader2 size={16} className="animate-spin" /> : <DatabaseBackup size={16} />}
              {backupState === 'working' ? 'Preparing…' : 'Download Backup'}
            </button>
          }
        >
          <p className="text-sm text-gray-600">
            Downloads everything in the database — products, categories, orders, customers, messages, coupons, reviews and settings — as one JSON file.
          </p>
          <p className="text-xs text-gray-500">
            Keep it somewhere safe (it contains customer details). Do this weekly. To restore, run <code className="bg-gray-100 px-1 rounded">npm run restore -- backup.json</code> on the computer that has the project.
          </p>
          {backupState === 'done' && <p className="text-xs text-emerald-700">Backup downloaded.</p>}
        </Card>
      </div>

      <p className="text-center text-sm text-gray-400">All configuration changes go live immediately upon saving.</p>
    </div>
  );
}

function SaveButton({ section, label, onClick, saving, saved }) {
  return (
    <button
      onClick={onClick}
      disabled={saving === section}
      className="bg-[#5A5A40] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#4a4a35] transition-colors disabled:opacity-60"
    >
      {saving === section ? <Loader2 size={16} className="animate-spin" /> : saved === section ? <Check size={16} /> : <Save size={16} />}
      {saved === section ? 'Saved!' : label}
    </button>
  );
}

function Card({ icon: Icon, tone, title, children, footer }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone}`}>
          <Icon size={20} />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>
      <div className="p-6 space-y-6 flex-1">{children}</div>
      <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end items-center gap-3">{footer}</div>
    </div>
  );
}
