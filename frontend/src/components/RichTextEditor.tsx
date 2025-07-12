'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Smile,
  X
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  error,
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Common emojis
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
    '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
  ];

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateValue();
  };

  const updateValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      execCommand('insertLineBreak');
    }
  };

  const insertEmoji = (emoji: string) => {
    execCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      execCommand('insertHTML', linkHtml);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const imgHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
      execCommand('insertHTML', imgHtml);
      setShowImageDialog(false);
      setImageUrl('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgHtml = `<img src="${event.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
        execCommand('insertHTML', imgHtml);
      };
      reader.readAsDataURL(file);
    }
  };

  const ToolbarButton: React.FC<{
    icon: React.ReactNode;
    onClick: () => void;
    title: string;
    active?: boolean;
  }> = ({ icon, onClick, title, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className={`border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all ${
      error ? 'border-red-300' : 'border-gray-300'
    } ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          onClick={() => execCommand('strikethrough')}
          title="Strikethrough"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton
          icon={<AlignLeft className="h-4 w-4" />}
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
        />
        <ToolbarButton
          icon={<AlignCenter className="h-4 w-4" />}
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
        />
        <ToolbarButton
          icon={<AlignRight className="h-4 w-4" />}
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton
          icon={<Link className="h-4 w-4" />}
          onClick={() => setShowLinkDialog(true)}
          title="Insert Link"
        />
        <ToolbarButton
          icon={<Image className="h-4 w-4" />}
          onClick={() => setShowImageDialog(true)}
          title="Insert Image"
        />
        <ToolbarButton
          icon={<Smile className="h-4 w-4" />}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Insert Emoji"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateValue}
        onKeyDown={handleKeyDown}
        className="p-4 min-h-[200px] outline-none prose prose-sm max-w-none text-gray-900"
        data-placeholder={placeholder}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          color: '#1f2937',
          opacity: '1'
        }}
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Emojis</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="p-1 hover:bg-gray-100 rounded text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Insert Link</span>
            <button
              onClick={() => setShowLinkDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Link Text</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Link text"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={insertLink}
                disabled={!linkUrl || !linkText}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
              </button>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Insert Image</span>
            <button
              onClick={() => setShowImageDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Or Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={insertImage}
                disabled={!imageUrl}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
              </button>
              <button
                onClick={() => setShowImageDialog(false)}
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 rounded-b-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 