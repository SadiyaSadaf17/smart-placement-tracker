import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => {
    api.get('/admin/students', { params: { search, limit: 50 } }).then((r) => setStudents(r.data.data));
  };

  useEffect(load, [search]);

  return (
    <section className="space-y-4">
      <Input placeholder="Search name or roll..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <section className="overflow-x-auto rounded-xl border dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Roll</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">CGPA</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t dark:border-slate-700">
                <td className="p-3">{s.fullName}</td>
                <td className="p-3">{s.rollNumber}</td>
                <td className="p-3">{s.branch}</td>
                <td className="p-3">{s.cgpa}</td>
                <td className="p-3"><Badge variant={s.placementStatus === 'placed' ? 'success' : 'default'}>{s.placementStatus}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
