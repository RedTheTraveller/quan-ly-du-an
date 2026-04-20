import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { INITIAL_COLS } from './utils/constants';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Timeline from './pages/Timeline';
import ResourceView from './pages/ResourceView';
import ProjectAccess from './pages/ProjectAccess';

const calcPert = (o, m, p, rate) => {
  const e = (Number(o) + 4 * Number(m) + Number(p)) / 6;
  const sd = (Number(p) - Number(o)) / 6;
  return {
    time: parseFloat(e.toFixed(1)),
    cost: Math.round(e * rate),
    risk: sd > 2 ? 'High' : sd > 1 ? 'Medium' : 'Low'
  };
};

export default function App() {
  const [user, setUser] = useState(null);
  
  const [currentProject, setCurrentProject] = useState(() => {
    try {
      const savedProject = localStorage.getItem('currentProject');
      if (savedProject && savedProject !== "undefined" && savedProject !== "null") {
        return JSON.parse(savedProject);
      }
    } catch (e) {
      console.error("Lỗi khi đọc dự án từ LocalStorage:", e);
    }
    return null;
  });

  const [login, setLogin] = useState({ u: '', p: '' });
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(INITIAL_COLS);
  const [modal, setModal] = useState({ open: false, task: null });
  const [projectUsers, setProjectUsers] = useState([]);

  // LƯU DỰ ÁN VÀO LOCAL STORAGE
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProject', JSON.stringify(currentProject));
    } else {
      localStorage.removeItem('currentProject');
    }
  }, [currentProject]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.email);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.email);
      } else {
        setUser(null);
        setCurrentProject(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (email) => {
    const { data } = await supabase.from('Users').select('*').eq('email', email).single();
    if (data) setUser(data);
  };

  // ==========================================
  // HÀM XỬ LÝ ĐĂNG NHẬP (ĐÃ ĐƯỢC THÊM VÀO ĐÂY)
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ 
      email: login.u, 
      password: login.p 
    });
    if (error) {
      alert("Đăng nhập thất bại: Sai email hoặc mật khẩu!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentProject(null);
    localStorage.removeItem('currentProject');
  };

  useEffect(() => {
    if (!currentProject) return;
    const fetchTeamMembers = async () => {
      const { data: members } = await supabase
        .from('Project_Members')
        .select('user_email, role')
        .eq('project_id', currentProject.project_id);

      if (members && members.length > 0) {
        const emails = members.map(m => m.user_email);
        const { data: usersInfo } = await supabase
          .from('Users')
          .select('id, email, name, avatar')
          .in('email', emails);

        if (usersInfo) {
          const combinedData = usersInfo.map(u => {
            const m = members.find(mem => mem.user_email === u.email);
            return { ...u, role: m.role, avatar: u.avatar || '👨‍💻' };
          });
          setProjectUsers(combinedData);
        }
      }
    };
    fetchTeamMembers();
  }, [currentProject]);

  const stats = useMemo(() => {
    let t = 0, c = 0, total = 0, done = 0;
    const userWork = {};
    Object.values(data).forEach(col => {
      col.items.forEach(i => {
        t += i.time; c += i.cost; total++;
        if (col.name === 'Done') done++;
        userWork[i.assignee] = (userWork[i.assignee] || 0) + i.time;
      });
    });
    return { time: t, cost: c, total, done, percent: total ? Math.round((done / total) * 100) : 0, userWork };
  }, [data]);

  const onDragEnd = (res) => {
    if (!res.destination) return;
    const { source, destination } = res;
    const newData = { ...data };
    const sCol = newData[source.droppableId];
    const dCol = newData[destination.droppableId];
    const sItems = [...sCol.items];
    const dItems = source.droppableId === destination.droppableId ? sItems : [...dCol.items];
    const [moved] = sItems.splice(source.index, 1);
    dItems.splice(destination.index, 0, moved);
    newData[source.droppableId] = { ...sCol, items: sItems };
    newData[destination.droppableId] = { ...dCol, items: dItems };
    setData(newData);
  };

  const handleSaveTask = (task) => {
    const est = calcPert(task.o, task.m, task.p, 100000);
    const newTask = { ...task, ...est };
    const newData = { ...data };
    if (task.id) {
      for (let key in newData) {
        const idx = newData[key].items.findIndex(i => i.id === task.id);
        if (idx !== -1) {
          newData[key].items[idx] = newTask;
          break;
        }
      }
    } else {
      newData['todo'].items.push({ ...newTask, id: Date.now().toString() });
    }
    setData(newData);
    setModal({ open: false, task: null });
  };

  const exportData = () => {
    const d = Object.entries(data).flatMap(([k, v]) => v.items.map(i => ({ Trạng_thái: v.name, ...i })));
    const url = window.URL.createObjectURL(new Blob(['\ufeff' + [Object.keys(d[0]).join(','), ...d.map(r => Object.values(r).join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'tasks.csv'; a.click();
  };

  // ==========================================
  // ĐÃ SỬA LẠI ĐOẠN NÀY ĐỂ TRUYỀN DỮ LIỆU VÀO <Auth />
  // ==========================================
  if (!user) {
    return <Auth login={login} setLogin={setLogin} onAuth={handleLogin} />;
  }

  if (!currentProject) {
    return <ProjectAccess onAccessGranted={setCurrentProject} handleLogout={handleLogout} />;
  }

  return (
    <div className="flex h-screen bg-[#F4F7FE] text-[#1B2559] font-sans overflow-hidden">
      <Sidebar view={view} setView={setView} user={user} setUser={setUser} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header view={view} search={search} setSearch={setSearch} exportData={exportData} user={user} />
        <div className="flex-1 overflow-auto px-10 pb-10">
          {view === 'dashboard' && <Dashboard stats={stats} />}
          {view === 'kanban' && (
            <KanbanBoard
              data={data}
              search={search}
              onDragEnd={onDragEnd}
              onEdit={t => setModal({open: true, task: t})}
              onAdd={() => setModal({open: true, task: null})}
              onDelete={(cid, tid) => {
                 const n = {...data}; n[cid].items = n[cid].items.filter(i => i.id !== tid); setData(n);
              }}
              canAdd={currentProject?.currentUserRole === 'PM'}
            />
          )}
          {view === 'timeline' && <Timeline data={data} />}
          {view === 'resource' && <ResourceView stats={stats} usersList={projectUsers} />}
        </div>
      </main>
      {modal.open && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({open: false, task: null})}
          onSave={handleSaveTask}
          usersList={projectUsers}
        />
      )}
    </div>
  );
}