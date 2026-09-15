import React, { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { fieldClass, labelClass, primaryBtn } from '../../components/admin/Modal';
import { saveContent, subscribeContent } from '../../lib/db';
import { mergeContent } from '../../lib/content';
import { Check, Loader2, Plus, Save, Trash2 } from 'lucide-react';

const SECTIONS = [
  ['contact', 'Contact & Footer'],
  ['faq', 'FAQ'],
  ['about', 'About Page'],
  ['productTabs', 'Product Tabs'],
];

export default function Content() {
  const [content, setContent] = useState(null);
  const [section, setSection] = useState('contact');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load once; don't overwrite edits in progress with live updates
  useEffect(() => {
    let first = true;
    return subscribeContent(
      (data) => {
        if (first) setContent(mergeContent(data));
        first = false;
      },
      (err) => setError(err.message)
    );
  }, []);

  if (!content) return <p className="text-gray-400 text-center py-12">{error || 'Loading content…'}</p>;

  const update = (path, value) =>
    setContent((c) => {
      const next = structuredClone(c);
      const keys = path.split('.');
      let target = next;
      keys.slice(0, -1).forEach((k) => (target = target[k]));
      target[keys.at(-1)] = value;
      return next;
    });

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const clean = structuredClone(content);
      clean.faq = clean.faq.filter((f) => f.question.trim() && f.answer.trim());
      clean.about.pillars = clean.about.pillars.filter((p) => p.title.trim());
      clean.about.journey = clean.about.journey.filter((j) => j.year.trim() || j.text.trim());
      clean.contact.addressLines = clean.contact.addressLines.map((l) => l.trim()).filter(Boolean);
      clean.productTabs.details = clean.productTabs.details.map((l) => l.trim()).filter(Boolean);
      await saveContent(clean);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'Only administrators can edit site content.' : err.message);
    } finally {
      setSaving(false);
    }
  };

  const listEditor = (path, items, blank, render) => (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-start bg-gray-50 rounded-xl p-3">
          <div className="flex-1 space-y-2">{render(item, (key, value) => update(`${path}`, items.map((it, i) => (i === index ? { ...it, [key]: value } : it))))}</div>
          <button type="button" onClick={() => update(path, items.filter((_, i) => i !== index))} className="p-2 text-gray-400 hover:text-red-600" aria-label="Remove">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => update(path, [...items, blank])} className="text-sm font-medium text-[#5A5A40] hover:underline inline-flex items-center gap-1">
        <Plus size={14} /> Add
      </button>
    </div>
  );

  return (
    <div>
      <AdminPageHeader titlePrefix="Site" titleAccent="Content" subtitle="Edit the text customers see — changes go live when you save">
        <button onClick={handleSave} disabled={saving} className={primaryBtn}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </AdminPageHeader>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2" role="alert">{error}</p>}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {SECTIONS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`px-4 py-2 rounded-full text-sm font-bold border whitespace-nowrap ${section === id ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'bg-white border-gray-200 text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {section === 'contact' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ct-phone" className={labelClass}>Phone</label>
                <input id="ct-phone" value={content.contact.phone} onChange={(e) => update('contact.phone', e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="ct-wa" className={labelClass}>WhatsApp (international, e.g. 923001234567)</label>
                <input id="ct-wa" value={content.contact.whatsapp} onChange={(e) => update('contact.whatsapp', e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="ct-email" className={labelClass}>Email</label>
                <input id="ct-email" type="email" value={content.contact.email} onChange={(e) => update('contact.email', e.target.value)} className={fieldClass} />
              </div>
            </div>
            <div>
              <label htmlFor="ct-address" className={labelClass}>Address (one line per row)</label>
              <textarea id="ct-address" rows={3} value={content.contact.addressLines.join('\n')} onChange={(e) => update('contact.addressLines', e.target.value.split('\n'))} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="ct-tagline" className={labelClass}>Footer tagline</label>
              <textarea id="ct-tagline" rows={2} value={content.footerTagline} onChange={(e) => update('footerTagline', e.target.value)} className={fieldClass} />
            </div>
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <legend className={labelClass}>Social links (leave empty to hide the icon)</legend>
              {['instagram', 'facebook', 'pinterest', 'twitter'].map((key) => (
                <div key={key}>
                  <label htmlFor={`ct-${key}`} className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{key === 'twitter' ? 'X / Twitter' : key}</label>
                  <input id={`ct-${key}`} type="url" placeholder="https://" value={content.social[key]} onChange={(e) => update(`social.${key}`, e.target.value)} className={fieldClass} />
                </div>
              ))}
            </fieldset>
          </>
        )}

        {section === 'faq' &&
          listEditor('faq', content.faq, { question: '', answer: '' }, (item, set) => (
            <>
              <input value={item.question} onChange={(e) => set('question', e.target.value)} placeholder="Question" aria-label="Question" className={`${fieldClass} font-semibold`} />
              <textarea value={item.answer} onChange={(e) => set('answer', e.target.value)} placeholder="Answer" aria-label="Answer" rows={2} className={fieldClass} />
            </>
          ))}

        {section === 'about' && (
          <>
            <div>
              <label htmlFor="ab-heading" className={labelClass}>Heading</label>
              <input id="ab-heading" value={content.about.heading} onChange={(e) => update('about.heading', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="ab-intro" className={labelClass}>Intro</label>
              <textarea id="ab-intro" rows={2} value={content.about.intro} onChange={(e) => update('about.intro', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="ab-body" className={labelClass}>Story</label>
              <textarea id="ab-body" rows={4} value={content.about.body} onChange={(e) => update('about.body', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <p className={labelClass}>Values (shown in two columns)</p>
              {listEditor('about.pillars', content.about.pillars, { title: '', text: '' }, (item, set) => (
                <>
                  <input value={item.title} onChange={(e) => set('title', e.target.value)} placeholder="Title" aria-label="Value title" className={fieldClass} />
                  <input value={item.text} onChange={(e) => set('text', e.target.value)} placeholder="Description" aria-label="Value description" className={fieldClass} />
                </>
              ))}
            </div>
            <div>
              <p className={labelClass}>Our Journey</p>
              {listEditor('about.journey', content.about.journey, { year: '', text: '' }, (item, set) => (
                <div className="flex gap-2">
                  <input value={item.year} onChange={(e) => set('year', e.target.value)} placeholder="2026" aria-label="Year" className={`${fieldClass} w-24`} />
                  <input value={item.text} onChange={(e) => set('text', e.target.value)} placeholder="What happened" aria-label="Milestone" className={fieldClass} />
                </div>
              ))}
            </div>
          </>
        )}

        {section === 'productTabs' && (
          <>
            <p className="text-sm text-gray-500">Default text for the tabs on every product page. A product can override these in its own edit form.</p>
            <div>
              <label htmlFor="pt-details" className={labelClass}>Product details (one bullet per line)</label>
              <textarea id="pt-details" rows={4} value={content.productTabs.details.join('\n')} onChange={(e) => update('productTabs.details', e.target.value.split('\n'))} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="pt-shipping" className={labelClass}>Shipping &amp; returns</label>
              <textarea id="pt-shipping" rows={3} value={content.productTabs.shipping} onChange={(e) => update('productTabs.shipping', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="pt-care" className={labelClass}>Care &amp; maintenance</label>
              <textarea id="pt-care" rows={3} value={content.productTabs.care} onChange={(e) => update('productTabs.care', e.target.value)} className={fieldClass} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
