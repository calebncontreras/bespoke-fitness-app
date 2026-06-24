import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface DocTemplate {
  id: number;
  name: string;
  description: string | null;
  required: boolean;
  file_path: string | null;
  created_at: string;
}

interface Submission {
  id: number;
  member_id: string;
  document_id: number;
  file_path: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  members: { name: string; email: string };
  documents: { name: string };
}

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<DocTemplate[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [{ data: docs }, { data: subs }] = await Promise.all([
      supabase.from('documents').select('*').order('created_at'),
      supabase
        .from('member_documents')
        .select('*, members(name, email), documents(name)')
        .order('submitted_at', { ascending: false }),
    ]);
    setDocuments(docs ?? []);
    setSubmissions((subs as unknown as Submission[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!name.trim() || !file) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('documents').upload(path, file);
    if (!error) {
      await supabase.from('documents').insert({
        name: name.trim(),
        description: description.trim() || null,
        required,
        file_path: path,
      });
      setName(''); setDescription(''); setRequired(true); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await load();
    }
    setUploading(false);
  };

  const handleDelete = async (doc: DocTemplate) => {
    if (doc.file_path) await supabase.storage.from('documents').remove([doc.file_path]);
    await supabase.from('documents').delete().eq('id', doc.id);
    await load();
  };

  const handleView = async (filePath: string, bucket: string) => {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const handleReview = async (submissionId: number, status: 'approved' | 'rejected') => {
    await supabase.from('member_documents').update({
      status,
      reviewed_at: new Date().toISOString(),
    }).eq('id', submissionId);

    const sub = submissions.find(s => s.id === submissionId);
    if (sub) {
      try {
        let notifyStatus = status;

        if (status === 'approved') {
          const [{ data: requiredDocs }, { data: approvedDocs }] = await Promise.all([
            supabase.from('documents').select('id').eq('required', true),
            supabase.from('member_documents')
              .select('document_id')
              .eq('member_id', sub.member_id)
              .eq('status', 'approved'),
          ]);
          // Include the doc we just approved (DB may not reflect it yet)
          const approvedIds = new Set([
            ...(approvedDocs?.map(a => a.document_id) ?? []),
            sub.document_id,
          ]);
          const allApproved = requiredDocs?.every(d => approvedIds.has(d.id));
          if (allApproved) notifyStatus = 'all_approved' as typeof status;
        }

        await supabase.functions.invoke('notify-client', {
          body: {
            clientEmail: sub.members.email,
            clientName: sub.members.name,
            documentName: sub.documents.name,
            status: notifyStatus,
          },
        });
      } catch {
        // best-effort
      }
    }

    await load();
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  if (loading) return <p className="text-sm font-light text-gray-400">Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Upload template */}
      <div className="border border-gray-200 p-5">
        <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 mb-4">Add Document Template</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Document name (e.g. Liability Waiver)"
            className="border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
          />
        </div>
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 text-xs font-light text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={required}
              onChange={e => setRequired(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            Required before onboarding
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="text-xs font-light text-gray-500 file:mr-3 file:px-3 file:py-1.5 file:border file:border-gray-200 file:text-xs file:font-light file:bg-white file:text-gray-600 file:cursor-pointer"
          />
          <button
            onClick={handleUpload}
            disabled={!name.trim() || !file || uploading}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-light hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Template list */}
      {documents.length > 0 && (
        <div>
          <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 mb-3">Templates</h3>
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="border border-gray-200 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-light text-gray-900">{doc.name}</span>
                  {doc.description && <span className="text-xs font-light text-gray-400">{doc.description}</span>}
                  {doc.required && (
                    <span className="text-[10px] font-light text-gray-400 border border-gray-200 px-1.5 py-0.5">Required</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {doc.file_path && (
                    <button onClick={() => handleView(doc.file_path!, 'documents')} className="text-xs font-light text-gray-400 hover:text-gray-700 transition">View</button>
                  )}
                  <button onClick={() => handleDelete(doc)} className="text-xs font-light text-gray-300 hover:text-red-400 transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending submissions */}
      <div>
        <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 mb-3">
          Pending Review{pending.length > 0 && <span className="ml-2 text-yellow-600">({pending.length})</span>}
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm font-light text-gray-400">No submissions awaiting review.</p>
        ) : (
          <div className="space-y-3">
            {pending.map(s => (
              <div key={s.id} className="border border-yellow-200 bg-yellow-50 p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-light text-gray-900">{s.members.name}</p>
                  <p className="text-xs font-light text-gray-500 mt-0.5">
                    {s.documents.name} · {new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleView(s.file_path, 'signed-documents')} className="text-xs font-light text-gray-500 hover:text-gray-900 underline transition">
                    View PDF
                  </button>
                  <button onClick={() => handleReview(s.id, 'approved')} className="px-3 py-1 bg-gray-900 text-white text-xs font-light hover:bg-gray-800 transition">
                    Approve
                  </button>
                  <button onClick={() => handleReview(s.id, 'rejected')} className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-light hover:bg-gray-50 transition">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 mb-3">Reviewed</h3>
          <div className="space-y-2">
            {reviewed.map(s => (
              <div key={s.id} className="border border-gray-200 p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-light text-gray-900">{s.members.name}</p>
                  <p className="text-xs font-light text-gray-500 mt-0.5">{s.documents.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleView(s.file_path, 'signed-documents')} className="text-xs font-light text-gray-400 hover:text-gray-700 transition">View</button>
                  <span className={`text-xs font-light ${s.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
