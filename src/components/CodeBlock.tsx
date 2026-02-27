import { useMemo, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';

type CodeBlockProps = {
  code: string;
  language?: CodeLanguage;
};

export type CodeLanguage = 'plaintext' | 'c' | 'cpp' | 'bash' | 'yaml' | 'json';

const PRISM_LANGUAGE: Record<CodeLanguage, string | null> = {
  plaintext: null,
  c: 'c',
  cpp: 'cpp',
  bash: 'bash',
  yaml: 'yaml',
  json: 'json'
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function CodeBlock({ code, language = 'plaintext' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const prismLanguage = PRISM_LANGUAGE[language];

  const highlighted = useMemo(() => {
    if (!prismLanguage) {
      return escapeHtml(code);
    }

    const grammar = Prism.languages[prismLanguage];
    if (!grammar) {
      return escapeHtml(code);
    }

    return Prism.highlight(code, grammar, prismLanguage);
  }, [code, prismLanguage]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-wrap">
      <button className="copy-btn" onClick={handleCopy} type="button">
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>
        <code className={prismLanguage ? `language-${prismLanguage}` : undefined} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
