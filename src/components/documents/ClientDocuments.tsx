import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface DocTemplate {
  id: number;
  name: string;
  description: string | null;
  file_path: string | null;
}

interface Submission {
  document_id: number;
  status: string;
}

interface ClientDocumentsProps {
  memberId: string;
  memberName: string;
  onAllSubmitted?: () => void;
}

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ memberId, memberName, onAllSubmitted }) => {
  const [documents, setDocuments] = useState<DocTemplate[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: docs }, { data: subs }] = await Promise.all([
      supabase.from('documents').select('*').eq('required', true).order('created_at'),
      supabase.from('member_documents').select('document_id, status').eq('member_id', memberId),
    ]);
    setDocuments(docs ?? []);
    setSubmissions(subs ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [memberId]);

  useEffect(() => {
    if (!loading && documents.length > 0) {
      const allSubmitted = documents.every(doc => submissions.some(s => s.document_id === doc.id));
      if (allSubmitted) onAllSubmitted?.();
    }
  }, [documents, submissions, loading]);

  const handleDownload = async (filePath: string, docName: string) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(filePath, 3600);
    if (data?.signedUrl) {
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = `${docName}.pdf`;
      a.click();
    }
  };

  const handleUpload = async (doc: DocTemplate, file: File) => {
    setUploading(doc.id);
    const path = `${memberId}/${doc.id}-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('signed-documents').upload(path, file);
    if (!error) {
      await supabase.from('member_documents').upsert({
        member_id: memberId,
        document_id: doc.id,
        file_path: path,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });
      try {
        await supabase.functions.invoke('notify-trainer', {
          body: { memberName, documentName: doc.name },
        });
      } catch {
        // Email notification is best-effort — don't block on failure
      }
      await load();
    }
    setUploading(null);
  };

  if (loading) return <p className="text-xs font-light text-gray-400">Loading documents...</p>;

  if (documents.length === 0) {
    return (
      <p className="text-xs font-light text-gray-400 text-center py-4">
        No documents required yet. Your trainer will add them shortly.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => {
        const submission = submissions.find(s => s.document_id === doc.id);
        const isUploading = uploading === doc.id;
        return (
          <div key={doc.id} className="border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-light text-gray-900">{doc.name}</p>
                {doc.description && <p className="text-xs font-light text-gray-400 mt-0.5">{doc.description}</p>}
              </div>
              {submission && (
                <span className={`text-[11px] font-light px-2 py-0.5 border ${
                  submission.status === 'approved' ? 'text-green-700 border-green-200 bg-green-50' :
                  submission.status === 'rejected' ? 'text-red-600 border-red-200 bg-red-50' :
                  'text-yellow-600 border-yellow-200 bg-yellow-50'
                }`}>
                  {submission.status === 'approved' ? 'Approved' : submission.status === 'rejected' ? 'Rejected — re-upload' : 'Pending review'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {doc.file_path && (
                <button
                  onClick={() => handleDownload(doc.file_path!, doc.name)}
                  className="text-xs font-light text-gray-500 border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition"
                >
                  Download template
                </button>
              )}
              {(!submission || submission.status === 'rejected') && (
                <label className={`text-xs font-light border px-3 py-1.5 transition cursor-pointer ${isUploading ? 'border-gray-200 text-gray-300' : 'border-gray-900 text-gray-900 hover:bg-gray-50'}`}>
                  {isUploading ? 'Uploading...' : submission?.status === 'rejected' ? 'Re-upload signed copy' : 'Upload signed copy'}
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={isUploading}
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(doc, f);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientDocuments;
