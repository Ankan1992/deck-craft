"use client";

import React, { useState } from "react";
import { SlideData } from "@/lib/slideGenerator";

interface SlideEditorProps {
  slide: SlideData;
  onUpdate: (updated: SlideData) => void;
  onClose: () => void;
}

export default function SlideEditor({ slide, onUpdate, onClose }: SlideEditorProps) {
  const [editedSlide, setEditedSlide] = useState<SlideData>({ ...slide });

  const handleSave = () => {
    onUpdate(editedSlide);
    onClose();
  };

  const updateBullet = (index: number, value: string) => {
    const bullets = [...(editedSlide.bullets || [])];
    bullets[index] = value;
    setEditedSlide({ ...editedSlide, bullets });
  };

  const addBullet = () => {
    const bullets = [...(editedSlide.bullets || []), "New point"];
    setEditedSlide({ ...editedSlide, bullets });
  };

  const removeBullet = (index: number) => {
    const bullets = (editedSlide.bullets || []).filter((_, i) => i !== index);
    setEditedSlide({ ...editedSlide, bullets });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const stats = [...(editedSlide.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    setEditedSlide({ ...editedSlide, stats });
  };

  const updateColumn = (side: 'left' | 'right', field: string, value: string, bulletIdx?: number) => {
    const key = side === 'left' ? 'leftColumn' : 'rightColumn';
    const col = { ...(editedSlide[key] || { title: '', bullets: [] }) };
    if (field === 'title') {
      col.title = value;
    } else if (field === 'bullet' && bulletIdx !== undefined) {
      col.bullets = [...col.bullets];
      col.bullets[bulletIdx] = value;
    }
    setEditedSlide({ ...editedSlide, [key]: col });
  };

  const updateStep = (index: number, field: string, value: string) => {
    const steps = [...(editedSlide.steps || [])];
    steps[index] = { ...steps[index], [field]: value };
    setEditedSlide({ ...editedSlide, steps });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Edit Slide</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Slide Type Badge */}
        <div className="mb-4">
          <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full font-medium">
            {slide.type.replace('-', ' ').toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-300 mb-1">Slide Title</label>
          <input
            type="text"
            value={editedSlide.title}
            onChange={(e) => setEditedSlide({ ...editedSlide, title: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Subtitle */}
        {(slide.type === 'title' || slide.type === 'closing') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-300 mb-1">Subtitle</label>
            <input
              type="text"
              value={editedSlide.subtitle || ''}
              onChange={(e) => setEditedSlide({ ...editedSlide, subtitle: e.target.value })}
              className="input-field"
            />
          </div>
        )}

        {/* Content */}
        {slide.content && !slide.bullets && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-300 mb-1">Content</label>
            <textarea
              value={editedSlide.content || ''}
              onChange={(e) => setEditedSlide({ ...editedSlide, content: e.target.value })}
              className="input-field min-h-[100px]"
              rows={4}
            />
          </div>
        )}

        {/* Bullets */}
        {editedSlide.bullets && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-300 mb-2">Bullet Points</label>
            {editedSlide.bullets.map((bullet, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="text-primary-400 mt-3 text-sm font-bold">{i + 1}.</span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBullet(i, e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={() => removeBullet(i)}
                  className="text-red-400 hover:text-red-300 px-2 transition-colors"
                  title="Remove bullet"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button onClick={addBullet} className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 mt-2 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add bullet point
            </button>
          </div>
        )}

        {/* Stats */}
        {editedSlide.stats && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-300 mb-2">Statistics</label>
            {editedSlide.stats.map((stat, i) => (
              <div key={i} className="glass-card p-3 mb-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-dark-400">Value</label>
                    <input value={stat.value} onChange={(e) => updateStat(i, 'value', e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-dark-400">Label</label>
                    <input value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-dark-400">Description</label>
                    <input value={stat.description || ''} onChange={(e) => updateStat(i, 'description', e.target.value)} className="input-field text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Two Columns */}
        {editedSlide.leftColumn && editedSlide.rightColumn && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            {(['left', 'right'] as const).map(side => {
              const col = side === 'left' ? editedSlide.leftColumn! : editedSlide.rightColumn!;
              return (
                <div key={side}>
                  <label className="block text-sm font-medium text-dark-300 mb-1">{side === 'left' ? 'Left' : 'Right'} Column Title</label>
                  <input
                    value={col.title}
                    onChange={(e) => updateColumn(side, 'title', e.target.value)}
                    className="input-field mb-2"
                  />
                  {col.bullets.map((b, i) => (
                    <input
                      key={i}
                      value={b}
                      onChange={(e) => updateColumn(side, 'bullet', e.target.value, i)}
                      className="input-field mb-1 text-sm"
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Process Steps */}
        {editedSlide.steps && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-300 mb-2">Process Steps</label>
            {editedSlide.steps.map((step, i) => (
              <div key={i} className="glass-card p-3 mb-2">
                <div className="flex gap-2 items-center mb-1">
                  <span className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                  <input value={step.title} onChange={(e) => updateStep(i, 'title', e.target.value)} className="input-field flex-1 text-sm" placeholder="Step title" />
                </div>
                <input value={step.description} onChange={(e) => updateStep(i, 'description', e.target.value)} className="input-field text-sm mt-1" placeholder="Step description" />
              </div>
            ))}
          </div>
        )}

        {/* Speaker Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark-300 mb-1">Speaker Notes (optional)</label>
          <textarea
            value={editedSlide.notes || ''}
            onChange={(e) => setEditedSlide({ ...editedSlide, notes: e.target.value })}
            className="input-field min-h-[60px]"
            rows={2}
            placeholder="Add notes visible only to the presenter..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
