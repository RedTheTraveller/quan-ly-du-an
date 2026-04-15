import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { INITIAL_COLS } from './utils/constants';

// Import các Components và Pages đã tách
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Timeline from './pages/Timeline';
import ResourceView from './pages/ResourceView';
import UpdatePassword from './pages/UpdatePassword';

// ==========================================
// 1. LOGIC TÍNH TOÁN PERT
// ==========================================
const calcPert = (o, m, p, rate) => {
  const e = (Number(o) + 4 * Number(m) + Number(p)) / 6;
  const sd = (Number(p) - Number(o)) / 6;
  return {
    time: parseFloat(e.toFixed(1)),
    cost: Math.round(e * rate),
    risk: sd > 2 ? 'High' : sd > 1 ? 'Medium' : 'Low'
  };
};

// ==========================================
// 2. COMPONENT CHÍNH
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState({ u: '', p: '' });
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, task: null });
  const [data, setData] = useState(INITIAL_COLS);
  const [usersList, setUsersList] = useState([]);

  // FETCH DỮ LIỆU TỪ SUPABASE
  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Kéo danh sách Users trước
      const { data: dbUsers } = await supabase.from('Users').select('*');
      let loadedUsers = [];
      if (dbUsers) {
        // Format lại data từ DB cho khớp với UI, DÙNG TEXT THAY VÌ ICON
        loadedUsers = dbUsers.map(u => ({
          id: u.id.toString(),
          name: u.name || u.email,
          role: u.role || 'Member',
          rate: u.role === 'PM' ? 500000 : 200000, // Tạm fix lương cứng theo Role
          avatar: `[${(u.role || 'Member').toUpperCase()}]` // Trả về dạng: [PM], [FULLSTACK], [ANALYST]...
        }));
        setUsersList(loadedUsers);
      }

      // 2. Kéo danh sách Tasks (Code cũ của bạn)
      const { data: tasks, error } = await supabase.from('Task').select('*');
      if (error) { console.error("Lỗi lấy dữ liệu:", error); return; }

      if (tasks && tasks.length > 0) {
        const newCols = JSON.parse(JSON.stringify(INITIAL_COLS));
        tasks.forEach(t => {
          const status = t.status || 'todo'; 
          if (newCols[status]) {
            newCols[status].items.push({
              id: t.id.toString(),
              title: t.task_name || 'Công việc chưa tên',
              assigneeId: 'u1',
              avatar: '[DEV]', // Sửa icon ở Task mặc định thành text luôn
              time: t.est || 0,
              cost: t.cost || 0,
              risk: t.risk || 'Low',
              day: 1 
            });
          }
        });
        setData(newCols);
      }
    };
    fetchInitialData();
  }, []);

  // THỐNG KÊ TỔNG HỢP
  const stats = useMemo(() => {
    let totalTime = 0, totalCost = 0, finished = 0, total = 0;
    const userWork = {};
    Object.values(data).forEach(col => {
      total += col.items.length;
      if (col.id === 'done') finished += col.items.length;
      col.items.forEach(i => {
        totalTime += i.time; totalCost += i.cost;
        userWork[i.assigneeId] = (userWork[i.assigneeId] || 0) + i.time;
      });
    });
    return { time: totalTime.toFixed(1), cost: totalCost, percent: total ? Math.round((finished/total)*100) : 0, total, userWork };
  }, [data]);

  // XỬ LÝ AUTH SUPABASE
  const handleAuth = async (e) => {
  e.preventDefault();
  
    // 1. Đăng nhập bằng hệ thống bảo mật Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: login.u,
      password: login.p,
    });

    if (authError) {
      alert("Sai tài khoản hoặc mật khẩu!");
      return; 
    }

    // 2. Nếu đúng mật khẩu, lấy thêm thông tin Name, Role từ bảng Users
    const { data: users, error: dbError } = await supabase
      .from('Users')
      .select('*')
      .eq('email', login.u);

    if (users && users.length > 0) {
      const dbUser = users[0];
      setUser({
        id: dbUser.id.toString(),
        username: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        avatar: dbUser.role === 'Admin' ? 'Member' : 'Developer', 
        rate: 200000 
      });
    } else {
      // Trường hợp tài khoản có trong Auth nhưng chưa có trong bảng Users
      setUser({ username: login.u, role: 'Member', avatar: 'Developer', rate: 200000 });
    }
  };

  // KÉO THẢ KANBAN
  const onDragEnd = (res) => {
    if (!res.destination) return;
    const { source: s, destination: d } = res;
    const newCols = { ...data };
    const [moved] = newCols[s.droppableId].items.splice(s.index, 1);
    newCols[d.droppableId].items.splice(d.index, 0, moved);
    setData(newCols);
  };

  // LƯU TASK LÊN SUPABASE
  const saveTask = async (taskData) => {
    const assignee = usersList.find(u => u.id === taskData.assigneeId) || usersList[0];
    const { time, cost, risk } = calcPert(taskData.o, taskData.m, taskData.p, assignee.rate);
    const newTask = { ...taskData, time, cost, risk, assigneeName: assignee.name, avatar: assignee.avatar };

    const { error } = await supabase.from('Task').insert([{ task_name: newTask.title, est: newTask.time, cost: newTask.cost, risk: newTask.risk }]);
    if (error) { alert("Lỗi lưu lên Database: " + error.message); return; }

    const newCols = { ...data };
    if (modal.task?.id) {
      Object.keys(newCols).forEach(id => {
        newCols[id].items = newCols[id].items.map(i => i.id === modal.task.id ? newTask : i);
      });
    } else {
      newCols.todo.items.push({ ...newTask, id: `T-${Date.now()}` });
    }
    setData(newCols);
    setModal({ open: false, task: null });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bao-cao-du-an.json'; a.click();
  };

  if (window.location.pathname === '/update-password') {
    return <UpdatePassword />;
  }

  // NẾU CHƯA ĐĂNG NHẬP
  if (!user) return <Auth login={login} setLogin={setLogin} onAuth={handleAuth} />;

  // GIAO DIỆN CHÍNH
  return (
    <div className="flex h-screen bg-[#F4F7FE] text-[#1B2559] font-sans overflow-hidden">
      
      <Sidebar view={view} setView={setView} user={user} setUser={setUser} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header view={view} search={search} setSearch={setSearch} exportData={exportData} user={user} />

        <div className="flex-1 overflow-auto px-10 pb-10">
          {view === 'dashboard' && <Dashboard stats={stats} />}
          {view === 'kanban' && <KanbanBoard data={data} search={search} onDragEnd={onDragEnd} onEdit={t => setModal({open: true, task: t})} onAdd={() => setModal({open: true, task: null})} onDelete={(cid, tid) => {
             const n = {...data}; n[cid].items = n[cid].items.filter(i => i.id !== tid); setData(n);
          }} canAdd={user.role === 'PM'} />}
          {view === 'timeline' && <Timeline data={data} />}
          {view === 'resource' && <ResourceView stats={stats} usersList={usersList} />}
        </div>
      </main>

      {modal.open && <TaskModal task={modal.task} close={() => setModal({open: false, task: null})} onSave={saveTask} usersList={usersList} />}
    </div>
  );
}