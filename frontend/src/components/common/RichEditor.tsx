'use client';

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
      // @ts-expect-error: licenseKey prop isn't defined in this version's types, but required by tinymce 7
      licenseKey="gpl"
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 500,
        menubar: false,
        placeholder: placeholder,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'hr'
        ],
        toolbar: 'undo redo | formatselect | fontsizeselect | ' +
          'bold italic underline strikethrough | forecolor backcolor highlight | ' +
          'alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | link image hr blockquote | removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        license_key: 'gpl',
        promotion: false,
        branding: false,
      }}
    />
  );
}
